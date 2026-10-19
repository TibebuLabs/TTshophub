import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  ask,
  CITIES,
  CMD,
  EVT,
  FREE_SHIPPING_OVER,
  JwtUser,
  ORDER_FLOW,
  OrderItem,
  rpcError,
  SVC,
} from '@app/common';
import { Order } from './order.entity';

// ─── Orders service ───────────────────────────────────────────────────────────

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
    @Inject(SVC.CATALOG) private readonly catalog: ClientProxy,
    @Inject(SVC.NOTIFY)  private readonly notify:  ClientProxy,
  ) {}

  // ─── Private helpers ─────────────────────────────────────────────────────

  /** Fetch an order by ID or throw a 404 RpcException. */
  private async findOrFail(id: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw rpcError(404, 'Order not found');
    return order;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Place a new order.
   *
   * Flow:
   * 1. Validate the delivery city.
   * 2. Reserve stock in the catalog service (throws if any item is unavailable).
   * 3. Persist the order.
   * 4. Emit `order.created` for notifications.
   * 5. If step 3 fails, release the reserved stock (saga compensation).
   *
   * NOTE: wallet payment is simulated.
   *       See README → "Payments" for Telebirr / CBE Birr / Chapa integration.
   */
  async create(data: any): Promise<Order> {
    const validPayments = ['cod', 'telebirr', 'cbe', 'chapa', 'bank', 'mpesa', 'ebirr'];
    if (!validPayments.includes(data.payment)) {
      throw rpcError(400, 'Unsupported payment method. Please select cod, telebirr, cbe, chapa, bank, mpesa, or ebirr.');
    }

    const city = CITIES[data.city];
    if (!city) throw rpcError(400, 'Unsupported delivery city');

    // Step 1: reserve stock (throws on shortage)
    const items: OrderItem[] = await ask(
      this.catalog,
      CMD.catalog.reserve,
      { items: data.items },
    );

    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping  = subtotal >= FREE_SHIPPING_OVER ? 0 : city.fee;
      const orderCount = await this.repo.count();
      const isOnlinePaid = data.payment !== 'cod';

      const order = await this.repo.save(
        this.repo.create({
          code:         `NM-${40001 + orderCount}`,
          userId:       data.userId,
          email:        data.email,
          customerName: data.customerName,
          phone:        data.phone,
          address:      data.address,
          city:         data.city,
          payment:      data.payment,
          paid:         isOnlinePaid,
          items,
          subtotal,
          shipping,
          total:        subtotal + shipping,
          status:       'placed',
        }),
      );

      this.notify.emit(EVT.orderCreated, {
        orderId:      order.id,
        code:         order.code,
        customerName: order.customerName,
        total:        order.total,
        city:         order.city,
      });

      return order;

    } catch (error) {
      // Saga compensation: release the reserved stock so it is available again
      try {
        await ask(this.catalog, CMD.catalog.release, { items });
      } catch (compensationError) {
        this.logger.error(
          'Order creation failed and reserved stock could not be released',
          compensationError instanceof Error
            ? compensationError.stack
            : String(compensationError),
        );
      }
      throw error;
    }
  }

  /**
   * Return all orders belonging to a specific customer, newest first.
   */
  mine(userId: string): Promise<Order[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin: list all orders with optional status filter and search query.
   *
   * @param filters.status  Filter by exact status value.
   * @param filters.q       Search across order code, customer name, and city.
   */
  all(filters: { status?: string; q?: string }): Promise<Order[]> {
    const baseWhere: any = filters.status ? { status: filters.status } : {};

    const where = filters.q
      ? [
          { ...baseWhere, code:         ILike(`%${filters.q}%`) },
          { ...baseWhere, customerName: ILike(`%${filters.q}%`) },
          { ...baseWhere, city:         ILike(`%${filters.q}%`) },
        ]
      : baseWhere;

    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  /**
   * Admin: advance an order to the next lifecycle stage.
   * Throws 409 if the order is already delivered or cancelled.
   */
  async advance(id: string): Promise<Order> {
    const order = await this.findOrFail(id);
    const currentIndex = ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]);

    if (currentIndex < 0 || currentIndex === ORDER_FLOW.length - 1) {
      throw rpcError(409, 'Order cannot move forward');
    }

    order.status = ORDER_FLOW[currentIndex + 1];

    // Mark COD orders as paid when they reach the customer
    if (order.status === 'delivered') {
      order.paid = true;
    }

    await this.repo.save(order);

    this.notify.emit(EVT.orderStatus, {
      userId:  order.userId,
      code:    order.code,
      status:  order.status,
      orderId: order.id,
    });

    return order;
  }

  /**
   * Cancel an order and return its stock to the catalog.
   *
   * - Customers can cancel only `placed` or `confirmed` orders.
   * - Admins can cancel up to `shipped`.
   */
  async cancel(data: { id: string; user: JwtUser }): Promise<Order> {
    const order = await this.findOrFail(data.id);
    const isAdmin = data.user.role === 'admin';

    if (!isAdmin && order.userId !== data.user.sub) {
      throw rpcError(403, 'Not your order');
    }

    const allowedStatuses = isAdmin
      ? ['placed', 'confirmed', 'packed', 'shipped']
      : ['placed', 'confirmed'];

    if (!allowedStatuses.includes(order.status)) {
      throw rpcError(409, 'This order can no longer be cancelled');
    }

    order.status = 'cancelled';
    await this.repo.save(order);

    // Return stock to the catalog
    await ask(this.catalog, CMD.catalog.release, { items: order.items });

    this.notify.emit(EVT.orderCancelled, {
      code:         order.code,
      orderId:      order.id,
      customerName: order.customerName,
      userId:       order.userId,
      byAdmin:      isAdmin,
    });

    return order;
  }

  /**
   * Admin: aggregated dashboard statistics.
   * Revenue counts only paid orders; cancelled orders are excluded from
   * most metrics but are still reported in the `cancelled` counter.
   */
  async stats(): Promise<{
    revenue: number;
    orders: number;
    toFulfil: number;
    cancelled: number;
    byCity: { city: string; total: number }[];
    pipeline: { status: string; count: number }[];
  }> {
    const all  = await this.repo.find();
    const live = all.filter((o) => o.status !== 'cancelled');

    // Revenue by city (for the bar chart)
    const byCity: Record<string, number> = {};
    for (const order of live) {
      byCity[order.city] = (byCity[order.city] || 0) + order.total;
    }

    return {
      revenue:   live.filter((o) => o.paid).reduce((sum, o) => sum + o.total, 0),
      orders:    live.length,
      toFulfil:  live.filter((o) => o.status !== 'delivered').length,
      cancelled: all.length - live.length,
      byCity: Object.entries(byCity)
        .map(([city, total]) => ({ city, total }))
        .sort((a, b) => b.total - a.total),
      pipeline: ORDER_FLOW.map((status) => ({
        status,
        count: live.filter((o) => o.status === status).length,
      })),
    };
  }

  /**
   * Admin: per-user spending summary (used in the Users tab).
   * Returns only users with at least one non-cancelled order.
   */
  async userStats(): Promise<{ userId: string; orders: number; spent: number }[]> {
    const all = await this.repo.find();
    const summary: Record<string, { userId: string; orders: number; spent: number }> = {};

    for (const order of all) {
      if (order.status === 'cancelled') continue;
      const row = (summary[order.userId] ??= {
        userId: order.userId,
        orders: 0,
        spent:  0,
      });
      row.orders += 1;
      row.spent  += order.total;
    }

    return Object.values(summary);
  }
}
