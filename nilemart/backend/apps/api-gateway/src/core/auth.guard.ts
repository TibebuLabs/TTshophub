import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtUser, Role } from '@app/common';
import { SessionState } from './session-state';

const ROLES_KEY = 'roles';

interface AuthenticatedRequest {
  headers: { authorization?: string };
  query: { token?: string | string[] };
  user?: JwtUser;
}

function extractToken(request: AuthenticatedRequest): string | undefined {
  const authorization = request.headers.authorization;

  if (authorization !== undefined) {
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);
    return match?.[1];
  }

  return typeof request.query.token === 'string'
    ? request.query.token
    : undefined;
}

function isJwtUser(payload: unknown): payload is JwtUser {
  if (!payload || typeof payload !== 'object') return false;

  const user = payload as Partial<JwtUser>;
  return (
    typeof user.sub === 'string' &&
    user.sub.length > 0 &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    (user.role === 'customer' || user.role === 'admin')
  );
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly session: SessionState,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Please sign in');
    }

    let user: unknown;
    try {
      user = this.jwt.verify<Record<string, unknown>>(token);
    } catch {
      throw new UnauthorizedException('Session expired, please sign in again');
    }

    if (!isJwtUser(user)) {
      throw new UnauthorizedException('Invalid session, please sign in again');
    }

    request.user = user;
    await this.session.ensure(user.sub, user.role);

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);

    if (!required?.length) return true;

    const { user } =
      ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}

/**
 * Attach both authentication and role guards to a route.
 *
 * @example
 * `@Auth()`          // any signed-in user
 * `@Auth('admin')`   // admins only
 * `@Auth('customer') // customers only`
 */
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );

/**
 * Parameter decorator that extracts the verified JWT payload from the request.
 *
 * @example
 * async myRoute(@CurrentUser() user: JwtUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user!,
);
