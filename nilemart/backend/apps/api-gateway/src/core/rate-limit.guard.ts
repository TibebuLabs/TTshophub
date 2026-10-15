import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

// ─── In-process rate-limit guard ─────────────────────────────────────────────
//
// Keeps a sliding window counter per user (when authenticated) or per IP.
// Performs probabilistic cleanup (1% chance per request) to avoid unbounded
// memory growth without needing a scheduled job.
//

interface WindowEntry {
  count:   number;
  resetAt: number;
}

/** Maximum requests allowed within one window. */
const LIMIT  = 100;

/** Window duration in milliseconds (15 minutes). */
const WINDOW = 15 * 60 * 1_000;

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, WindowEntry>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key  = this.buildKey(request);
    const now  = Date.now();

    // Probabilistic cleanup of expired entries (runs ~1% of requests)
    if (Math.random() < 0.01) {
      this.evictExpired(now);
    }

    let entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + WINDOW };
      this.store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > LIMIT) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1_000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:    `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
          error:      'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /** Build a unique key: prefer authenticated user ID over IP address. */
  private buildKey(request: any): string {
    const userId = request.user?.sub;
    const ip     = request.ip || request.connection?.remoteAddress;
    return userId || ip || 'unknown';
  }

  /** Remove all expired entries from the store. */
  private evictExpired(now: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
