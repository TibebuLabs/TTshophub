/**
 * Check the same PostgreSQL connection settings used by the Nest services.
 *
 * Run from the backend directory with: npm run db:check
 */

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Client } = require('pg');
require('dotenv').config();

function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    if (!process.env.DB_PASSWORD) {
      throw new Error(
        'DATABASE_URL is not configured and DB_PASSWORD is missing from backend/.env.',
      );
    }

    return {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'nilemart',
    };
  }

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL URL.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname ||
    !url.username ||
    !url.password ||
    url.pathname.length <= 1
  ) {
    throw new Error(
      'DATABASE_URL must include a PostgreSQL host, database, username, and password.',
    );
  }

  const isSupabase =
    url.hostname.endsWith('.supabase.co') ||
    url.hostname.endsWith('.pooler.supabase.com');
  const caPath = process.env.DATABASE_SSL_CA_PATH;
  const ssl = caPath
    ? { ca: readFileSync(resolve(process.cwd(), caPath), 'utf8'), rejectUnauthorized: true }
    : isSupabase
      ? { rejectUnauthorized: true }
      : undefined;

  if (isSupabase || caPath) {
    for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
      url.searchParams.delete(parameter);
    }
  }

  return {
    connectionString: url.toString(),
    ...(ssl ? { ssl } : {}),
  };
}

function connectionFailureReason(error) {
  switch (error.code) {
    case 'ECONNREFUSED':
      return 'the PostgreSQL server refused the connection; check that it is running and that the host/port are correct.';
    case 'ENOTFOUND':
      return 'the database host could not be resolved; check DATABASE_URL or DB_HOST.';
    case 'ETIMEDOUT':
    case 'ECONNRESET':
      return 'the database connection timed out or was reset; check network access and database availability.';
    case '28P01':
    case '28000':
      return 'PostgreSQL rejected the credentials; check DATABASE_URL or DB_USER/DB_PASSWORD in backend/.env.';
    case '3D000':
      return 'the configured database does not exist; check the database name in backend/.env.';
    default:
      return error.code
        ? `PostgreSQL connection failed (error code ${error.code}).`
        : `PostgreSQL connection failed: ${error.message}`;
  }
}

async function main() {
  let client;

  try {
    client = new Client(getConnectionConfig());
    await client.connect();
    const result = await client.query('SELECT current_database() AS database');
    console.log(`DATABASE: STARTED AND CONNECTED (database: ${result.rows[0].database})`);
  } catch (error) {
    console.error(`DATABASE: NOT CONNECTED — ${connectionFailureReason(error)}`);
    process.exitCode = 1;
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (error) {
        console.warn(`DATABASE: Could not close the test connection cleanly: ${error.message}`);
      }
    }
  }
}

main();
