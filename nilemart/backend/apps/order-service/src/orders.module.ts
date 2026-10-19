import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dbModuleConfig, ENDPOINTS, SVC, tcpClient } from '@app/common';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ChapaService } from './payment/chapa.service';
import { PaymentController } from './payment/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Use the orders schema locally and shophub_orders on Supabase.
    TypeOrmModule.forRootAsync(dbModuleConfig('orders')),
    TypeOrmModule.forFeature([Order]),

    // Communicate with catalog (stock reservation) and notification service
    ClientsModule.register([
      tcpClient(SVC.CATALOG, ENDPOINTS.CATALOG),
      tcpClient(SVC.NOTIFY,  ENDPOINTS.NOTIFY),
    ]),
  ],
  controllers: [OrdersController, PaymentController],
  providers: [OrdersService, ChapaService],
})
export class OrdersModule {}
