-- ShopHub tables for Supabase PostgreSQL.
-- Paste into the Supabase Dashboard SQL Editor and run against your project.
-- Supabase manages the database name (`postgres`); ShopHub uses four
-- service-isolated, ShopHub-prefixed schemas inside that database.
-- This first migrates legacy schema names without moving or deleting rows.
-- If both an old and new schema exist, it stops instead of risking a conflict.

DO $migration$
DECLARE
    old_name TEXT;
    new_name TEXT;
BEGIN
    FOR old_name, new_name IN
        SELECT * FROM (VALUES
            ('nilemart_auth', 'shophub_auth'),
            ('catalog', 'shophub_catalog'),
            ('orders', 'shophub_orders'),
            ('notify', 'shophub_notify')
        ) AS schema_names(old_name, new_name)
    LOOP
        IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = old_name) THEN
            IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = new_name) THEN
                RAISE EXCEPTION
                    'Both schemas "%" and "%" exist; resolve this schema conflict before migration.',
                    old_name, new_name;
            END IF;
            EXECUTE format('ALTER SCHEMA %I RENAME TO %I', old_name, new_name);
        END IF;
    END LOOP;
END
$migration$;

CREATE SCHEMA IF NOT EXISTS shophub_auth;
CREATE SCHEMA IF NOT EXISTS shophub_catalog;
CREATE SCHEMA IF NOT EXISTS shophub_orders;
CREATE SCHEMA IF NOT EXISTS shophub_notify;

GRANT USAGE, CREATE ON SCHEMA shophub_auth TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_catalog TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_orders TO postgres;
GRANT USAGE, CREATE ON SCHEMA shophub_notify TO postgres;

CREATE TABLE IF NOT EXISTS shophub_catalog.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    "nameAm" VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(255) NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    price INTEGER NOT NULL,
    "oldPrice" INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    seller VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    "descriptionAm" TEXT NOT NULL DEFAULT '',
    rating DOUBLE PRECISION NOT NULL DEFAULT 4,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE shophub_catalog.products
    ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "IDX_products_name"
    ON shophub_catalog.products (name);
CREATE INDEX IF NOT EXISTS "IDX_products_category"
    ON shophub_catalog.products (category);
CREATE INDEX IF NOT EXISTS "IDX_products_price"
    ON shophub_catalog.products (price);
CREATE INDEX IF NOT EXISTS "IDX_products_category_price"
    ON shophub_catalog.products (category, price);
CREATE INDEX IF NOT EXISTS "IDX_products_createdAt"
    ON shophub_catalog.products ("createdAt");

CREATE TABLE IF NOT EXISTS shophub_catalog.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "userName" VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    images TEXT NOT NULL DEFAULT '',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_reviews_productId"
    ON shophub_catalog.reviews ("productId");
CREATE INDEX IF NOT EXISTS "IDX_reviews_userId"
    ON shophub_catalog.reviews ("userId");
CREATE INDEX IF NOT EXISTS "IDX_reviews_productId_createdAt"
    ON shophub_catalog.reviews ("productId", "createdAt");

CREATE TABLE IF NOT EXISTS shophub_catalog.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR(255) NOT NULL,
    "productId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_wishlists_userId_productId" UNIQUE ("userId", "productId")
);

CREATE INDEX IF NOT EXISTS "IDX_wishlists_userId"
    ON shophub_catalog.wishlists ("userId");
CREATE INDEX IF NOT EXISTS "IDX_wishlists_productId"
    ON shophub_catalog.wishlists ("productId");

CREATE TABLE IF NOT EXISTS shophub_orders.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) NOT NULL UNIQUE,
    "userId" VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    payment VARCHAR(255) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    items JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'placed',
    notes TEXT,
    "deliveredAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_orders_code"
    ON shophub_orders.orders (code);
CREATE INDEX IF NOT EXISTS "IDX_orders_userId"
    ON shophub_orders.orders ("userId");
CREATE INDEX IF NOT EXISTS "IDX_orders_status"
    ON shophub_orders.orders (status);
CREATE INDEX IF NOT EXISTS "IDX_orders_userId_createdAt"
    ON shophub_orders.orders ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_orders_status_createdAt"
    ON shophub_orders.orders (status, "createdAt");

CREATE TABLE IF NOT EXISTS shophub_notify.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(255) NOT NULL DEFAULT '',
    "orderId" VARCHAR(255),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_notifications_audience"
    ON shophub_notify.notifications (audience);
CREATE INDEX IF NOT EXISTS "IDX_notifications_userId"
    ON shophub_notify.notifications ("userId");
CREATE INDEX IF NOT EXISTS "IDX_notifications_read"
    ON shophub_notify.notifications (read);
CREATE INDEX IF NOT EXISTS "IDX_notifications_userId_read_createdAt"
    ON shophub_notify.notifications ("userId", read, "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_notifications_audience_createdAt"
    ON shophub_notify.notifications (audience, "createdAt");

CREATE TABLE IF NOT EXISTS shophub_auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'customer',
    suspended BOOLEAN NOT NULL DEFAULT FALSE,
    "lastLoginAt" TIMESTAMP,
    avatar VARCHAR(255),
    city VARCHAR(255) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_users_email"
    ON shophub_auth.users (email);
CREATE INDEX IF NOT EXISTS "IDX_users_role"
    ON shophub_auth.users (role);

-- Quick inventory: expect six tables across four ShopHub service schemas.
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND (
      (table_schema = 'shophub_auth' AND table_name = 'users')
      OR (table_schema = 'shophub_catalog' AND table_name IN ('products', 'reviews', 'wishlists'))
      OR (table_schema = 'shophub_orders' AND table_name = 'orders')
      OR (table_schema = 'shophub_notify' AND table_name = 'notifications')
  )
ORDER BY table_schema, table_name;
