import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { call, CMD, SVC } from '@app/common';

// ─── SessionState ─────────────────────────────────────────────────────────────
//
// Validates that the JWT owner is still active (not suspended or deleted).
// A 30-second in-memory cache keeps the hot path fast without round-tripping
// the auth service on every request.
//

/** Cached entry: whether the account is OK and when we last checked. */
interface CacheEntry {
  active: boolean;
  role: 'customer' | 'admin';
  checkedAt: number;
}

/** How long a cache entry stays valid in milliseconds. */
const CACHE_TTL_MS = 30_000;

@Injectable()
export class SessionState {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(@Inject(SVC.AUTH) private readonly auth: ClientProxy) {}

  /**
   * Ensure the user account is active.
   * Reads from cache when the entry is fresh; otherwise calls auth-service.
   *
   * @throws UnauthorizedException when the account is suspended or deleted.
   */
  async ensure(userId: string, tokenRole: 'customer' | 'admin'): Promise<void> {
    const cached = this.cache.get(userId);
    const isStale = !cached || Date.now() - cached.checkedAt >= CACHE_TTL_MS;

    if (!isStale) {
      if (!cached.active || cached.role !== tokenRole) {
        throw new UnauthorizedException('Your account session is no longer valid');
      }
      return;
    }

    let user: { suspended: boolean; role: 'customer' | 'admin' };
    try {
      user = await call<{ suspended: boolean; role: 'customer' | 'admin' }>(
        this.auth,
        CMD.auth.me,
        { id: userId },
      );
    } catch (e) {
      if (e instanceof HttpException && [403, 404].includes(e.getStatus())) {
        this.cache.set(userId, {
          active: false,
          role: tokenRole,
          checkedAt: Date.now(),
        });
        throw new UnauthorizedException('Account suspended or removed');
      }

      throw e;
    }

    if (
      typeof user?.suspended !== 'boolean' ||
      (user.role !== 'customer' && user.role !== 'admin')
    ) {
      throw new Error('Auth service returned an invalid user session response');
    }

    const active = !user.suspended;
    this.cache.set(userId, { active, role: user.role, checkedAt: Date.now() });
    if (!active) {
      throw new UnauthorizedException('Account suspended or removed');
    }
    if (user.role !== tokenRole) {
      throw new UnauthorizedException('Your account role changed; please sign in again');
    }
  }

  /**
   * Evict a user's cache entry so the next request re-validates immediately.
   * Call this after suspending, unsuspending, or deleting a user.
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
