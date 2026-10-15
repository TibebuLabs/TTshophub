import { X509Certificate } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface PostgresUrlConnection {
  url: string;
  ssl?: {
    ca?: string;
    rejectUnauthorized: true;
  };
}

/**
 * Parse a PostgreSQL URL and build verified TLS settings for Supabase.
 * A CA certificate may be supplied for environments without the issuing CA
 * in Node's default trust store.
 */
export function postgresUrlConnection(
  value: string,
  caPath?: string,
): PostgresUrlConnection {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('The database URL must be a valid PostgreSQL connection URL.');
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('The database URL must use postgres:// or postgresql://.');
  }
  if (
    !url.hostname ||
    !url.username ||
    !url.password ||
    url.pathname.length <= 1
  ) {
    throw new Error(
      'The database URL must include a PostgreSQL host, database, username, and password.',
    );
  }

  const isSupabase =
    url.hostname.endsWith('.supabase.co') ||
    url.hostname.endsWith('.pooler.supabase.com');
  const ca = caPath
    ? readFileSync(resolve(process.cwd(), caPath), 'utf8')
    : undefined;

  if (caPath && ca !== undefined) {
    const certificates = ca.match(
      /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g,
    );
    if (!certificates?.length) {
      throw new Error(
        `The database CA file "${caPath}" is empty or is not a PEM certificate. ` +
          'Download the CA certificate for this Supabase project from Database Settings > SSL Configuration.',
      );
    }

    try {
      for (const certificate of certificates) {
        new X509Certificate(certificate);
      }
    } catch {
      throw new Error(
        `The database CA file "${caPath}" contains an invalid certificate. ` +
          'Download the CA certificate for this Supabase project from Database Settings > SSL Configuration.',
      );
    }
  }

  if (isSupabase || ca) {
    for (const parameter of [
      'sslmode',
      'sslrootcert',
      'sslcert',
      'sslkey',
    ]) {
      url.searchParams.delete(parameter);
    }
  }

  return {
    url: url.toString(),
    ...(isSupabase || ca
      ? { ssl: { ...(ca ? { ca } : {}), rejectUnauthorized: true as const } }
      : {}),
  };
}
