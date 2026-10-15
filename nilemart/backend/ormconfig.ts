import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from 'dotenv';
import { postgresUrlConnection } from './libs/common/src/postgres-connection';

config();

const databaseUrl = (
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL
)?.trim();
let connection: Partial<PostgresConnectionOptions>;

if (databaseUrl) {
  connection = postgresUrlConnection(
    databaseUrl,
    process.env.DATABASE_SSL_CA_PATH,
  );
} else {
  connection = {
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'nilemart',
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connection,
  entities: ['apps/**/src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/**/*{.ts,.js}'],
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV === 'development',
});
