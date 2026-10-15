import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const BUCKET = 'nilemart-product-images';
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface ProductImageFile {
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class ProductImageStorage {
  private readonly client: SupabaseClient;
  private readonly projectOrigin: string;

  constructor() {
    const url = process.env.SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

    if (!url || !secretKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SECRET_KEY are required for product image storage.',
      );
    }

    this.projectOrigin = new URL(url).origin;
    this.client = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async upload(files: ProductImageFile[]): Promise<string[]> {
    if (!files.length) {
      throw new BadRequestException('Choose at least one product image.');
    }

    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        const extension = MIME_EXTENSIONS[file.mimetype];
        if (!extension || !this.matchesImageType(file.buffer, file.mimetype)) {
          throw new BadRequestException(
            'Only valid JPEG, PNG, and WebP image files are supported.',
          );
        }

        const objectPath = `products/${randomUUID()}.${extension}`;
        const { error } = await this.client.storage
          .from(BUCKET)
          .upload(objectPath, file.buffer, {
            cacheControl: '31536000',
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) throw new Error(error.message);
        uploadedPaths.push(objectPath);

        const { data } = this.client.storage
          .from(BUCKET)
          .getPublicUrl(objectPath);
        imageUrls.push(data.publicUrl);
      }

      return imageUrls;
    } catch (error) {
      if (uploadedPaths.length) {
        const { error: cleanupError } = await this.client.storage
          .from(BUCKET)
          .remove(uploadedPaths);
        if (cleanupError) {
          throw new ServiceUnavailableException(
            'Image upload failed, and uploaded-file cleanup also failed.',
          );
        }
      }

      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown storage error';
      throw new ServiceUnavailableException(`Supabase image upload failed: ${message}`);
    }
  }

  async removeProductImages(urls: string[]): Promise<void> {
    const paths = urls
      .map((url) => this.objectPathFromPublicUrl(url))
      .filter((path): path is string => path !== null);

    if (!paths.length) return;

    const { error } = await this.client.storage.from(BUCKET).remove(paths);
    if (error) {
      throw new ServiceUnavailableException(
        `Product data was saved, but its old images could not be removed from Supabase Storage: ${error.message}`,
      );
    }
  }

  private objectPathFromPublicUrl(value: string): string | null {
    try {
      const url = new URL(value);
      const prefix = `/storage/v1/object/public/${BUCKET}/`;
      if (url.origin !== this.projectOrigin || !url.pathname.startsWith(prefix)) {
        return null;
      }

      const path = decodeURIComponent(url.pathname.slice(prefix.length));
      return /^products\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(path)
        ? path
        : null;
    } catch {
      return null;
    }
  }

  private matchesImageType(buffer: Buffer, mimeType: string): boolean {
    if (mimeType === 'image/jpeg') {
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (mimeType === 'image/png') {
      return buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    }

    return mimeType === 'image/webp' &&
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
  }
}
