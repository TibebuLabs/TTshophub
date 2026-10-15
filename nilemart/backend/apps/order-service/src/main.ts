import { bootstrapService, ENDPOINTS } from '@app/common';
import { OrdersModule } from './orders.module';
bootstrapService(OrdersModule, 'order-service', ENDPOINTS.ORDER.port);
