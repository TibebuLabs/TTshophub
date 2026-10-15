import { Injectable, Logger } from '@nestjs/common';

/**
 * Validates required environment variables at startup.
 *
 * Call `validateEnvironment()` once during bootstrap. If any variable is
 * missing or unsafe, errors are collected and thrown together so the
 * operator sees every problem in a single log message.
 */
@Injectable()
export class EnvValidatorService {
  private readonly logger = new Logger(EnvValidatorService.name);

  /**
   * Run all validation rules. Throws if any check fails.
   */
  validateEnvironment(): void {
    const errors: string[] = [];

    this.validateDatabaseConfig(errors);

    this.requireVar('WEB_ORIGIN', errors);

    this.validateJwtSecret(errors);
    this.validateAdminInviteCode(errors);

    this.requireVar('AUTH_HOST', errors);
    this.requireVar('AUTH_PORT', errors);
    this.requireVar('CATALOG_HOST', errors);
    this.requireVar('CATALOG_PORT', errors);
    this.requireVar('ORDER_HOST', errors);
    this.requireVar('ORDER_PORT', errors);
    this.requireVar('NOTIFY_HOST', errors);
    this.requireVar('NOTIFY_PORT', errors);
    this.requireVar('GATEWAY_HOST', errors);
    this.requireVar('GATEWAY_TCP_PORT', errors);

    if (errors.length > 0) {
      this.logger.error('Environment validation failed:');
      errors.forEach((msg) => this.logger.error(`  - ${msg}`));
      throw new Error(
        `Environment validation failed with ${errors.length} error(s). See logs above.`,
      );
    }

    this.logger.log('Environment validation passed');
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Assert that an env var is set (non-empty). */
  private requireVar(name: string, errors: string[]): void {
    if (!process.env[name]) {
      errors.push(`${name} is required but not set`);
    }
  }

  /** Validate either a PostgreSQL URL or the individual connection settings. */
  private validateDatabaseConfig(errors: string[]): void {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (!databaseUrl) {
      this.requireVar('DB_HOST', errors);
      this.requireVar('DB_PORT', errors);
      this.requireVar('DB_USER', errors);
      this.requireVar('DB_PASSWORD', errors);
      return;
    }

    try {
      const parsedUrl = new URL(databaseUrl);
      if (
        (parsedUrl.protocol !== 'postgres:' && parsedUrl.protocol !== 'postgresql:') ||
        !parsedUrl.hostname ||
        !parsedUrl.username ||
        !parsedUrl.password ||
        parsedUrl.pathname.length <= 1
      ) {
        errors.push(
          'DATABASE_URL must include a PostgreSQL host, database, username, and password',
        );
      }
    } catch {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection URL');
    }
  }

  /**
   * Assert that JWT_SECRET is present and meets minimum security requirements:
   * - At least 32 characters
   * - Not the placeholder default value
   */
  private validateJwtSecret(errors: string[]): void {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      errors.push('JWT_SECRET is required but not set');
      return;
    }

    if (secret.length < 32) {
      errors.push(
        `JWT_SECRET must be at least 32 characters (current length: ${secret.length})`,
      );
    }

    if (secret === 'change-me-to-a-long-random-string') {
      errors.push('JWT_SECRET must be changed from the placeholder default');
    }
  }

  /**
   * Assert that ADMIN_INVITE_CODE is set and, in production, is not the
   * well-known default value.
   */
  private validateAdminInviteCode(errors: string[]): void {
    const code = process.env.ADMIN_INVITE_CODE;

    if (!code) {
      errors.push('ADMIN_INVITE_CODE is required but not set');
      return;
    }

    if (process.env.NODE_ENV === 'production' && code === 'NILE-ADMIN') {
      errors.push(
        'ADMIN_INVITE_CODE must be changed from the default value in production',
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Standalone JWT validator (used outside the DI container)
// ---------------------------------------------------------------------------

/**
 * Validates JWT_SECRET without requiring NestJS dependency injection.
 * Useful in bootstrap scripts or plain Node.js utilities.
 */
export class JwtValidator {
  /**
   * Throws if JWT_SECRET is absent, too short, or is the placeholder value.
   */
  static validate(): void {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    if (secret.length < 32) {
      throw new Error(
        `JWT_SECRET must be at least 32 characters (current: ${secret.length})`,
      );
    }

    if (secret === 'change-me-to-a-long-random-string') {
      throw new Error('JWT_SECRET must be changed from the placeholder default');
    }
  }
}
