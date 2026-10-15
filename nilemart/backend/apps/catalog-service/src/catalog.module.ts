import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbModuleConfig, ENDPOINTS, SVC, tcpClient } from '@app/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Product } from './product.entity';
import { Review } from './review.entity';
import { Wishlist } from './wishlist.entity';

@Module({
  imports: [
    // Use the catalog schema locally and shophub_catalog on Supabase.
    TypeOrmModule.forRootAsync(dbModuleConfig('catalog')),
    TypeOrmModule.forFeature([Product, Review, Wishlist]),

    // Emit low-stock events to the notification service
    ClientsModule.register([
      tcpClient(SVC.NOTIFY, ENDPOINTS.NOTIFY),
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
