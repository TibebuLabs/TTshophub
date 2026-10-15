-- NileMart Single Database Setup
-- Database: nilemart
-- Owner: nilemart
-- Password: 13d32144
-- Port: 5432

-- 1. Create database if it doesn't exist
-- Run this as postgres superuser first time

-- Create user
CREATE USER nilemart WITH PASSWORD '13d32144';

-- Create database
CREATE DATABASE nilemart WITH OWNER nilemart;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nilemart TO nilemart;

-- Connect to nilemart database
\c nilemart

-- 2. Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS catalog AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS orders AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS notify AUTHORIZATION nilemart;

-- 3. Grant all privileges on schemas
GRANT ALL ON SCHEMA auth TO nilemart;
GRANT ALL ON SCHEMA catalog TO nilemart;
GRANT ALL ON SCHEMA orders TO nilemart;
GRANT ALL ON SCHEMA notify TO nilemart;

-- 4. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA orders GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA notify GRANT ALL ON TABLES TO nilemart;

-- 5. Verify setup
SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('auth', 'catalog', 'orders', 'notify');

-- Expected output:
-- schema_name
-- ------------
-- auth
-- catalog
-- orders
-- notify
