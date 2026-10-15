-- =====================================================
-- NileMart Database Setup Script
-- Database: nilemart
-- User: postgres
-- Password: admin123
-- =====================================================

-- Step 1: Connect to the 'nilemart' database in pgAdmin
-- (Right-click on 'nilemart' -> Query Tool)

-- Step 2: Create the 4 required schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS notify;

-- Step 3: Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA catalog TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA orders TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA notify TO postgres;

-- Step 4: Set search path to include all schemas (optional, for convenience)
ALTER DATABASE nilemart SET search_path TO public, auth, catalog, orders, notify;

-- Step 5: Verify schemas were created successfully
SELECT 
    schema_name,
    schema_owner,
    CASE 
        WHEN schema_name = 'auth' THEN '✓ Auth Service Schema'
        WHEN schema_name = 'catalog' THEN '✓ Catalog Service Schema'
        WHEN schema_name = 'orders' THEN '✓ Order Service Schema'
        WHEN schema_name = 'notify' THEN '✓ Notification Service Schema'
    END as description
FROM information_schema.schemata 
WHERE schema_name IN ('auth', 'catalog', 'orders', 'notify')
ORDER BY schema_name;

-- =====================================================
-- Expected Result: You should see 4 rows:
-- auth     | postgres | ✓ Auth Service Schema
-- catalog  | postgres | ✓ Catalog Service Schema
-- notify   | postgres | ✓ Notification Service Schema
-- orders   | postgres | ✓ Order Service Schema
-- =====================================================
