import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { call, CMD, JwtUser, SVC } from '@app/common';
import { Auth, CurrentUser } from '../core/auth.guard';
import { SessionState } from '../core/session-state';
import { AdminCreateUserDto, AdminUpdateUserDto, SuspendDto } from '../dto';

// ─── Users controller (gateway) ──────────────────────────────────────────────
//
// Admin-only user management. All endpoints require the `admin` role via the
// class-level @Auth('admin') decorator.
//

@Controller('users')
@Auth('admin')
export class UsersController {
  constructor(
    @Inject(SVC.AUTH)  private readonly auth:    ClientProxy,
    @Inject(SVC.ORDER) private readonly orders:  ClientProxy,
    private readonly session: SessionState,
  ) {}

  /**
   * List all users enriched with their order count and total spending.
   * Combines data from auth-service and order-service in parallel.
   */
  @Get()
  async list() {
    const [users, stats] = await Promise.all([
      call<any[]>(this.auth,   CMD.auth.list),
      call<any[]>(this.orders, CMD.order.userStats),
    ]);

    const statsByUserId = new Map<string, any>(
      stats.map((s) => [s.userId, s]),
    );

    return users.map((user) => ({
      ...user,
      orders: statsByUserId.get(user.id)?.orders ?? 0,
      spent:  statsByUserId.get(user.id)?.spent  ?? 0,
    }));
  }

  /** Create a new user account with an optional temporary password. */
  @Post()
  create(@Body() data: AdminCreateUserDto) {
    return call(this.auth, CMD.auth.create, data);
  }

  /** Update a user's name, phone, or role. Invalidates their session cache. */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: AdminUpdateUserDto) {
    const user = await call(this.auth, CMD.auth.update, { id, ...data });
    this.session.invalidate(id);
    return user;
  }

  /**
   * Toggle the suspended state of a user.
   * Admins cannot suspend their own account.
   */
  @Patch(':id/suspend')
  suspend(
    @CurrentUser() me: JwtUser,
    @Param('id') id: string,
    @Body() data: SuspendDto,
  ) {
    if (id === me.sub) {
      throw new BadRequestException('You cannot suspend your own account');
    }

    this.session.invalidate(id);
    return call(this.auth, CMD.auth.suspend, { id, suspended: data.suspended });
  }

  /** Generate a new temporary password for a user and return it. */
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string) {
    return call(this.auth, CMD.auth.resetPassword, { id });
  }

  /**
   * Permanently delete a user.
   * Admins cannot delete their own account.
   */
  @Delete(':id')
  remove(@CurrentUser() me: JwtUser, @Param('id') id: string) {
    if (id === me.sub) {
      throw new BadRequestException('You cannot delete your own account');
    }

    this.session.invalidate(id);
    return call(this.auth, CMD.auth.remove, { id });
  }
}
