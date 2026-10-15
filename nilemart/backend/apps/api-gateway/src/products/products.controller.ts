import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { call, CATEGORIES, CITIES, CMD, FREE_SHIPPING_OVER, SVC } from '@app/common';
import { Auth } from '../core/auth.guard';
import { ProductDto, UpdateProductDto } from '../dto';
import { ProductImageFile, ProductImageStorage } from './product-image-storage.service';

interface ProductImageRecord {
  images?: string[];
}

const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// ─── Products controller (gateway) ───────────────────────────────────────────
//
// Public product catalog + admin CRUD.
// Also exposes /api/config so the UI can render categories and delivery info
// without hardcoding it in the frontend bundle.
//

@Controller()
export class ProductsController {
  constructor(
    @Inject(SVC.CATALOG) private readonly catalog: ClientProxy,
    private readonly imageStorage: ProductImageStorage,
  ) {}

  /**
   * Returns storefront configuration: available categories, delivery cities
   * with fees and ETAs, and the free-shipping threshold.
   * The frontend uses this so the data never needs to be hardcoded.
   */
  @Get('config')
  config() {
    return {
      categories:       CATEGORIES,
      cities:           CITIES,
      freeShippingOver: FREE_SHIPPING_OVER,
    };
  }

  /** List products — supports full-text search, category, price cap, and sort. */
  @Get('products')
  list(@Query() query: any) {
    return call(this.catalog, CMD.catalog.list, query);
  }

  /** Fetch a single product by ID. */
  @Get('products/:id')
  get(@Param('id') id: string) {
    return call(this.catalog, CMD.catalog.get, { id });
  }

  /** Admin: upload product photos to the public Supabase Storage bucket. */
  @Post('products/images')
  @Auth('admin')
  @UseInterceptors(
    FilesInterceptor('files', MAX_PRODUCT_IMAGES, {
      limits: { fileSize: MAX_IMAGE_SIZE, files: MAX_PRODUCT_IMAGES },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException('Only JPEG, PNG, and WebP images are supported.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: ProductImageFile[] | undefined,
  ): Promise<{ images: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('Choose at least one image to upload.');
    }
    return { images: await this.imageStorage.upload(files) };
  }

  /** Admin: create a new product. */
  @Post('products')
  @Auth('admin')
  create(@Body() data: ProductDto) {
    return call(this.catalog, CMD.catalog.create, data);
  }

  /** Admin: update an existing product. */
  @Patch('products/:id')
  @Auth('admin')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    const current = await call<ProductImageRecord>(
      this.catalog,
      CMD.catalog.get,
      { id },
    );
    const updated = await call<ProductImageRecord>(
      this.catalog,
      CMD.catalog.update,
      { id, ...data },
    );
    const retainedImages = new Set(updated.images ?? []);
    await this.imageStorage.removeProductImages(
      (current.images ?? []).filter((url) => !retainedImages.has(url)),
    );
    return updated;
  }

  /** Admin: permanently delete a product. */
  @Delete('products/:id')
  @Auth('admin')
  async remove(@Param('id') id: string) {
    const product = await call<ProductImageRecord>(
      this.catalog,
      CMD.catalog.get,
      { id },
    );
    const result = await call(this.catalog, CMD.catalog.remove, { id });
    await this.imageStorage.removeProductImages(product.images ?? []);
    return result;
  }
}
