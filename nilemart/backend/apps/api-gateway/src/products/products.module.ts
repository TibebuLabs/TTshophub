import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductImageStorage } from './product-image-storage.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductImageStorage],
})
export class ProductsModule {}
