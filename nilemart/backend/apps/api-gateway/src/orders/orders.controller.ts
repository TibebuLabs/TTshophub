import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { call, CMD, JwtUser, SVC } from '@app/common';
import { Auth, CurrentUser } from '../core/auth.guard';
import { CreateOrderDto } from '../dto';

// ─── Orders controller (gateway) ─────────────────────────────────────────────

@Controller('orders')
export class OrdersController {
  constructor(@Inject(SVC.ORDER) private readonly orders: ClientProxy) {}

  /** Customer: place a new order. Merges the JWT identity into the payload. */
  @Post()
  @Auth('customer')
  create(@CurrentUser() user: JwtUser, @Body() data: CreateOrderDto) {
    return call(this.orders, CMD.order.create, {
      ...data,
      userId: user.sub,
      email:  user.email,
    });
  }

  /** Customer: list their own orders. */
  @Get('mine')
  @Auth('customer')
  mine(@CurrentUser() user: JwtUser) {
    return call(this.orders, CMD.order.mine, { userId: user.sub });
  }

  /** Admin: aggregated dashboard statistics. */
  @Get('stats')
  @Auth('admin')
  stats() {
    return call(this.orders, CMD.order.stats);
  }

  /** Admin: list all orders with optional status filter and search. */
  @Get()
  @Auth('admin')
  all(@Query() query: any) {
    return call(this.orders, CMD.order.all, query);
  }

  /** Admin: advance an order to its next lifecycle stage. */
  @Patch(':id/advance')
  @Auth('admin')
  advance(@Param('id') id: string) {
    return call(this.orders, CMD.order.advance, { id });
  }

  /** Cancel an order (accessible by both the owning customer and admins). */
  @Patch(':id/cancel')
  @Auth()
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return call(this.orders, CMD.order.cancel, { id, user });
  }
}
