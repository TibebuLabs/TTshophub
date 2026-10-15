-- Quick Setup for NileMart
-- Run this as postgres superuser: psql -U postgres -f quick-setup.sql

-- 1. Drop existing (if any)
DROP DATABASE IF EXISTS nilemart;
DROP USER IF EXISTS nilemart;

-- 2. Create user
CREATE USER nilemart WITH PASSWORD '13d32144';

-- 3. Create database
CREATE DATABASE nilemart WITH OWNER nilemart;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nilemart TO nilemart;
GRANT CREATE ON DATABASE nilemart TO nilemart;

-- 4. Connect to nilemart database
\c nilemart

-- 5. Create schemas
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS catalog AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS orders AUTHORIZATION nilemart;
CREATE SCHEMA IF NOT EXISTS notify AUTHORIZATION nilemart;

-- 6. Grant all privileges on schemas
GRANT ALL ON SCHEMA auth TO nilemart;
GRANT ALL ON SCHEMA catalog TO nilemart;
GRANT ALL ON SCHEMA orders TO nilemart;
GRANT ALL ON SCHEMA notify TO nilemart;

-- 7. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA orders GRANT ALL ON TABLES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA notify GRANT ALL ON TABLES TO nilemart;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT ALL ON SEQUENCES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA orders GRANT ALL ON SEQUENCES TO nilemart;
ALTER DEFAULT PRIVILEGES IN SCHEMA notify GRANT ALL ON SEQUENCES TO nilemart;

-- 8. Verify setup
SELECT 
  'Database: ' || current_database() || ', User: ' || current_user AS setup_info;

SELECT 'Schema: ' || schema_name AS schemas_created
FROM information_schema.schemata 
WHERE schema_name IN ('auth', 'catalog', 'orders', 'notify')
ORDER BY schema_name;

-- Done!
\echo '✅ Setup complete! Now run: npm run dev in backend folder'
