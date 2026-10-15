-- Run this once in the Supabase Dashboard SQL Editor to enable public product
-- image URLs. Uploads and deletes are restricted to the backend's secret key;
-- the public bucket allows buyers to display images without signing in.

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'nilemart-product-images',
    'nilemart-product-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Public can view NileMart product images'
    ) THEN
        CREATE POLICY "Public can view NileMart product images"
            ON storage.objects
            FOR SELECT
            TO anon, authenticated
            USING (bucket_id = 'nilemart-product-images');
    END IF;
END
$$;

-- Product image URLs are stored in this existing array column.
ALTER TABLE shophub_catalog.products
    ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
