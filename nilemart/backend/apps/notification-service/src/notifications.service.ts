import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EVT, SVC } from '@app/common';
import { Notification } from './notification.entity';

// ─── Notifications service ───────────────────────────────────────────────────

/** Format a number as an ETB currency string (e.g. `ETB 1,450`). */
const etb = (amount: number): string =>
  'ETB ' + Math.round(amount).toLocaleString('en-US');

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @Inject(SVC.GATEWAY) private readonly gateway: ClientProxy,
  ) {}

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Persist a notification and fan it out to all connected browsers via the
   * API gateway's SSE endpoint.
   */
  private async push(partial: Partial<Notification>): Promise<Notification> {
    const saved = await this.repo.save(
      this.repo.create({
        userId:  null,
        orderId: null,
        body:    '',
        ...partial,
      }),
    );

    this.gateway.emit(EVT.notificationCreated, saved);
    return saved;
  }

  // ─── Event handlers ──────────────────────────────────────────────────────

  /** Notifies admins when a new order is placed. */
  orderCreated(event: {
    orderId: string;
    code: string;
    customerName: string;
    total: number;
    city: string;
  }): Promise<Notification> {
    return this.push({
      audience: 'admin',
      type:     'order',
      orderId:  event.orderId,
      title:    `New order ${event.code}`,
      body:     `${event.customerName} · ${etb(event.total)} · ${event.city}`,
    });
  }

  /** Notifies admins when an order is cancelled. */
  orderCancelled(event: {
    orderId: string;
    code: string;
    customerName: string;
    byAdmin: boolean;
  }): Promise<Notification> {
    return this.push({
      audience: 'admin',
      type:     'cancel',
      orderId:  event.orderId,
      title:    `Order ${event.code} cancelled`,
      body:     event.byAdmin ? 'Cancelled by an admin' : `Cancelled by ${event.customerName}`,
    });
  }

  /** Notifies the specific customer when their order status changes. */
  orderStatus(event: {
    userId: string;
    orderId: string;
    code: string;
    status: string;
  }): Promise<Notification> {
    return this.push({
      audience: 'user',
      userId:   event.userId,
      type:     'status',
      orderId:  event.orderId,
      title:    `Order ${event.code} is now ${event.status}`,
    });
  }

  /** Notifies admins when a product's stock drops to ≤ 3 units. */
  stockLow(event: {
    productId: string;
    name: string;
    stock: number;
  }): Promise<Notification> {
    return this.push({
      audience: 'admin',
      type:     'stock',
      title:    `Low stock: ${event.name}`,
      body:     `${event.stock} left`,
    });
  }

  /** Notifies admins when a new customer registers. */
  userRegistered(event: { name: string; email: string }): Promise<Notification> {
    return this.push({
      audience: 'admin',
      type:     'user',
      title:    'New customer registered',
      body:     `${event.name} · ${event.email}`,
    });
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  /**
   * Fetch the 30 most recent notifications for the caller's audience.
   *
   * @param scope  `{ audience: 'admin' }` or `{ audience: 'user', userId }`.
   */
  list(scope: {
    audience: 'admin' | 'user';
    userId?: string;
  }): Promise<Notification[]> {
    const where =
      scope.audience === 'admin'
        ? { audience: 'admin' as const }
        : { audience: 'user' as const, userId: scope.userId };

    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take:  30,
    });
  }

  /**
   * Mark all unread notifications as read for the caller's audience.
   */
  async markRead(scope: {
    audience: 'admin' | 'user';
    userId?: string;
  }): Promise<{ ok: true }> {
    const where =
      scope.audience === 'admin'
        ? { audience: 'admin' as const }
        : { audience: 'user' as const, userId: scope.userId };

    await this.repo.update(where, { read: true });
    return { ok: true };
  }
}
