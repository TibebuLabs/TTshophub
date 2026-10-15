import { Logger } from '@nestjs/common';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import { postgresUrlConnection } from './postgres-connection';

/**
 * Build a PostgreSQL connection config for one ShopHub microservice.
 * Supabase uses the managed `postgres` database; services are isolated in
 * ShopHub-prefixed schemas within it. DATABASE_URL takes precedence over DB_*.
 */
export const dbConfig = (schema: string): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  let connection: Partial<PostgresConnectionOptions>;
  let isSupabase = false;

  if (databaseUrl) {
    const databaseConnection = postgresUrlConnection(
      databaseUrl,
      process.env.DATABASE_SSL_CA_PATH,
    );
    const host = new URL(databaseConnection.url).hostname;
    isSupabase =
      host.endsWith('.supabase.co') ||
      host.endsWith('.pooler.supabase.com');
    connection = databaseConnection;
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL must point to Supabase in production.');
    }

    connection = {
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'nilemart',
    };
  }

  if (process.env.NODE_ENV === 'production' && !isSupabase) {
    throw new Error(
      'Production DATABASE_URL must use a Supabase PostgreSQL host.',
    );
  }

  if (process.env.NODE_ENV === 'production' && process.env.DB_SYNCHRONIZE === 'true') {
    throw new Error('DB_SYNCHRONIZE=true is not allowed in production.');
  }

  const synchronize =
    process.env.NODE_ENV !== 'production' &&
    (process.env.DB_SYNCHRONIZE === 'true' ||
      (!databaseUrl && process.env.DB_SYNCHRONIZE !== 'false'));

  const supabaseSchema: Record<string, string> = {
    auth: 'shophub_auth',
    catalog: 'shophub_catalog',
    orders: 'shophub_orders',
    notify: 'shophub_notify',
  };

  return {
    type: 'postgres',
    ...connection,
    schema: isSupabase ? (supabaseSchema[schema] ?? schema) : schema,
    autoLoadEntities: true,
    synchronize,
    logging: ['error', 'warn'] as ('error' | 'warn')[],
    retryAttempts: 3,
    retryDelay: 3_000,
  };
};

export const dbModuleConfig = (schema: string): TypeOrmModuleAsyncOptions => {
  const logger = new Logger('Database');

  return {
    useFactory: () => dbConfig(schema),
    dataSourceFactory: async (options) => {
      if (!options) {
        throw new Error('Database options are required to connect to PostgreSQL.');
      }

      const dataSource = new DataSource(options);

      try {
        await dataSource.initialize();
        logger.log(`Connected to PostgreSQL (${schema} schema).`);
        return dataSource;
      } catch (error) {
        logger.error(`PostgreSQL is NOT connected (${schema} schema).`);
        throw error;
      }
    },
  };
};
