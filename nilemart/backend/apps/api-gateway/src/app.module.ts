import { Controller, Get, Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';

// ─── Health check ─────────────────────────────────────────────────────────────

@Controller('health')
class HealthController {
  /** GET /api/health — used by load balancers and uptime monitors. */
  @Get()
  ok() {
    return {
      status:  'ok',
      service: 'api-gateway',
      time:    new Date().toISOString(),
    };
  }
}

// ─── App module ───────────────────────────────────────────────────────────────

@Module({
  imports: [
    CoreModule,          // JWT, TCP clients, SessionState, NotificationHub
    AuthModule,          // POST /api/auth/register, login, GET /api/auth/me …
    ProductsModule,      // GET /api/products, /api/config …
    OrdersModule,        // POST /api/orders, GET /api/orders/mine …
    UsersModule,         // Admin: GET /api/users, PATCH /api/users/:id …
    NotificationsModule, // GET /api/notifications, SSE stream …
  ],
  controllers: [HealthController],
})
export class AppModule {}
