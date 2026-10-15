import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbModuleConfig, ENDPOINTS, SVC, tcpClient } from '@app/common';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    // Use the orders schema locally and shophub_orders on Supabase.
    TypeOrmModule.forRootAsync(dbModuleConfig('orders')),
    TypeOrmModule.forFeature([Order]),

    // Communicate with catalog (stock reservation) and notification service
    ClientsModule.register([
      tcpClient(SVC.CATALOG, ENDPOINTS.CATALOG),
      tcpClient(SVC.NOTIFY,  ENDPOINTS.NOTIFY),
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
