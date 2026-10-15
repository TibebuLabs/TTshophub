import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { EVT, Role, rpcError, SVC } from '@app/common';
import { User } from './user.entity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a random 4-digit temporary password like "Shop7432". */
const tempPw = (): string => 'Shop' + Math.floor(1000 + Math.random() * 9000);

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    @Inject(SVC.NOTIFY) private readonly notify: ClientProxy,
  ) {}

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Strip the password hash before returning user data to callers. */
  private pub(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  /** Build a login session: JWT token + sanitised user object. */
  private session(user: User): { token: string; user: Omit<User, 'passwordHash'> } {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return {
      token: this.jwt.sign(payload),
      user: this.pub(user),
    };
  }

  /** Load a user by ID or throw 404. */
  private async find(id: string, includePasswordHash = false): Promise<User> {
    const query = this.users.createQueryBuilder('user').where('user.id = :id', { id });
    if (includePasswordHash) query.addSelect('user.passwordHash');
    const user = await query.getOne();
    if (!user) throw rpcError(404, 'User not found');
    return user;
  }

  // -------------------------------------------------------------------------
  // Public API (called via MessagePattern)
  // -------------------------------------------------------------------------

  /**
   * Register a new account.
   * - Admins must supply the correct `ADMIN_INVITE_CODE`.
   * - Duplicate emails are rejected with 409.
   * - A welcome event is emitted for new customers.
   */
  async register(d: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: Role;
    adminCode?: string;
  }): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const role: Role = d.role === 'admin' ? 'admin' : 'customer';

    if (role === 'admin') {
      const inviteCode = process.env.ADMIN_INVITE_CODE || 'NILE-ADMIN';
      if (d.adminCode !== inviteCode) {
        throw rpcError(403, 'Invalid admin invite code');
      }
    }

    const email = d.email.toLowerCase();
    if (await this.users.findOne({ where: { email } })) {
      throw rpcError(409, 'An account with this email already exists');
    }

    const user = await this.users.save(
      this.users.create({
        name: d.name.trim(),
        email,
        phone: d.phone,
        role,
        passwordHash: await bcrypt.hash(d.password, 10),
      }),
    );

    if (role === 'customer') {
      this.notify.emit(EVT.userRegistered, { name: user.name, email: user.email });
    }

    return this.session(user);
  }

  /**
   * Authenticate an existing user.
   * - Wrong credentials → 401.
   * - Suspended account → 403.
   * - Role mismatch (e.g. admin account signed in via customer form) → 403.
   */
  async login(d: {
    email: string;
    password: string;
    role?: Role;
  }): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: d.email.toLowerCase() })
      .getOne();

    const passwordOk =
      user && (await bcrypt.compare(d.password, user.passwordHash));

    if (!passwordOk) {
      throw rpcError(401, 'Incorrect email or password');
    }

    if (user.suspended) {
      throw rpcError(403, 'This account is suspended. Please contact ShopHub support.');
    }

    if (d.role && d.role !== user.role) {
      const hint =
        user.role === 'admin'
          ? 'This is an admin account. Choose "Admin".'
          : 'This is a customer account. Choose "Customer".';
      throw rpcError(403, hint);
    }

    return this.session(user);
  }

  /**
   * Return the current user's public profile (used by the gateway to refresh
   * the session and verify the account is still active).
   */
  async me(id: string): Promise<Omit<User, 'passwordHash'>> {
    return this.pub(await this.find(id));
  }

  /** List all users ordered by creation date (admin only). */
  async list(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.users.find({ order: { createdAt: 'DESC' } });
    return users.map((u) => this.pub(u));
  }

  /**
   * Admin: create a new user account with an optional temporary password.
   * Returns the public user object plus the temp password for one-time display.
   */
  async create(d: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    password?: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; tempPassword: string }> {
    const email = d.email.toLowerCase();

    if (await this.users.findOne({ where: { email } })) {
      throw rpcError(409, 'This email is already registered');
    }

    const tempPassword = d.password || tempPw();
    const user = await this.users.save(
      this.users.create({
        name: d.name,
        email,
        phone: d.phone,
        role: d.role,
        passwordHash: await bcrypt.hash(tempPassword, 10),
      }),
    );

    return { user: this.pub(user), tempPassword };
  }

  /** Admin: update a user's name, phone, or role. */
  async update(d: {
    id: string;
    name?: string;
    phone?: string;
    role?: Role;
  }): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.find(d.id);

    if (d.name) user.name = d.name;
    if (d.phone) user.phone = d.phone;
    if (d.role) user.role = d.role;

    return this.pub(await this.users.save(user));
  }

  /** Admin: suspend or reactivate an account. */
  async suspend(d: {
    id: string;
    suspended: boolean;
  }): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.find(d.id);
    user.suspended = d.suspended;
    return this.pub(await this.users.save(user));
  }

  /**
   * Admin: generate a new temporary password for a user.
   * Returns the plaintext password for one-time display; the hash is stored.
   */
  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const user = await this.find(id);
    const tempPassword = tempPw();
    user.passwordHash = await bcrypt.hash(tempPassword, 10);
    await this.users.save(user);
    return { tempPassword };
  }

  /** Admin: permanently delete a user account. */
  async remove(id: string): Promise<{ ok: boolean }> {
    await this.find(id); // throws 404 if not found
    await this.users.delete(id);
    return { ok: true };
  }

  /** Customer: update own name and phone number. */
  async profile(d: {
    id: string;
    name: string;
    phone: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.find(d.id);
    user.name = d.name;
    user.phone = d.phone;
    return this.pub(await this.users.save(user));
  }

  /** Customer: change own password after verifying the current one. */
  async password(d: {
    id: string;
    current: string;
    next: string;
  }): Promise<{ ok: boolean }> {
    const user = await this.find(d.id, true);

    const currentOk = await bcrypt.compare(d.current, user.passwordHash);
    if (!currentOk) throw rpcError(400, 'Current password is incorrect');

    user.passwordHash = await bcrypt.hash(d.next, 10);
    await this.users.save(user);
    return { ok: true };
  }
}
