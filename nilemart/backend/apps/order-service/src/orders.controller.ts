import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CMD } from '@app/common';
import { OrdersService } from './orders.service';

// ─── Orders microservice controller ──────────────────────────────────────────
//
// Receives TCP messages from the API gateway and delegates to OrdersService.
//

@Controller()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  /** Place a new order. */
  @MessagePattern(CMD.order.create)
  create(@Payload() data: any) {
    return this.service.create(data);
  }

  /** Return all orders for the requesting customer. */
  @MessagePattern(CMD.order.mine)
  mine(@Payload() data: { userId: string }) {
    return this.service.mine(data.userId);
  }

  /** Admin: list all orders with optional filters. */
  @MessagePattern(CMD.order.all)
  all(@Payload() data: any) {
    return this.service.all(data || {});
  }

  /** Admin: advance an order to its next lifecycle stage. */
  @MessagePattern(CMD.order.advance)
  advance(@Payload() data: { id: string }) {
    return this.service.advance(data.id);
  }

  /** Cancel an order (customer or admin). */
  @MessagePattern(CMD.order.cancel)
  cancel(@Payload() data: any) {
    return this.service.cancel(data);
  }

  /** Admin: return aggregated dashboard statistics. */
  @MessagePattern(CMD.order.stats)
  stats() {
    return this.service.stats();
  }

  /** Admin: return per-user order and spending summary. */
  @MessagePattern(CMD.order.userStats)
  userStats() {
    return this.service.userStats();
  }
}
