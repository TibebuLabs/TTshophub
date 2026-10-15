import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CMD, EVT } from '@app/common';
import { NotificationsService } from './notifications.service';

// ─── Notifications microservice controller ────────────────────────────────────
//
// Handles two kinds of messages:
//   1. Domain events emitted by other services (fire-and-forget).
//   2. Request/response queries from the API gateway.
//

@Controller()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ─── Domain events ───────────────────────────────────────────────────────

  /** Called when a new order is placed (emitted by order-service). */
  @EventPattern(EVT.orderCreated)
  onOrderCreated(@Payload() event: any) {
    return this.service.orderCreated(event);
  }

  /** Called when an order is cancelled (emitted by order-service). */
  @EventPattern(EVT.orderCancelled)
  onOrderCancelled(@Payload() event: any) {
    return this.service.orderCancelled(event);
  }

  /** Called when an order advances to a new status (emitted by order-service). */
  @EventPattern(EVT.orderStatus)
  onOrderStatus(@Payload() event: any) {
    return this.service.orderStatus(event);
  }

  /** Called when a product's stock drops below the low-stock threshold (emitted by catalog-service). */
  @EventPattern(EVT.stockLow)
  onStockLow(@Payload() event: any) {
    return this.service.stockLow(event);
  }

  /** Called when a new customer registers (emitted by auth-service). */
  @EventPattern(EVT.userRegistered)
  onUserRegistered(@Payload() event: any) {
    return this.service.userRegistered(event);
  }

  // ─── Gateway queries ─────────────────────────────────────────────────────

  /** Return the latest notifications for the caller's audience. */
  @MessagePattern(CMD.notify.list)
  list(@Payload() scope: any) {
    return this.service.list(scope);
  }

  /** Mark all notifications as read for the caller's audience. */
  @MessagePattern(CMD.notify.read)
  read(@Payload() scope: any) {
    return this.service.markRead(scope);
  }
}
