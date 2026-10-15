-- Prefer CREATE_ALL_TABLES.sql: it migrates the existing ShopHub tables without
-- dropping data, then creates any missing tables and indexes.
-- This small standalone setup remains available for creating only the schemas.

CREATE SCHEMA IF NOT EXISTS shophub_auth;
CREATE SCHEMA IF NOT EXISTS shophub_catalog;
CREATE SCHEMA IF NOT EXISTS shophub_orders;
CREATE SCHEMA IF NOT EXISTS shophub_notify;

GRANT USAGE, CREATE ON SCHEMA shophub_auth TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_catalog TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_orders TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_notify TO postgres;
