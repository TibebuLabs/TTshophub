import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem, OrderStatus, PaymentMethod } from '@app/common';

// ─── Order entity ─────────────────────────────────────────────────────────────
//
// Lives in the local `orders` or Supabase `shophub_orders` schema.
// Items are stored as a JSONB snapshot of product details at checkout time
// so the order history is never affected by later catalog changes.
//

@Entity('orders')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable order reference shown to the customer (e.g. NM-40001). */
  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  email: string;

  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ type: 'varchar' })
  payment: PaymentMethod;

  /**
   * True once payment has been collected.
   * For COD orders this is set to true when the order is marked `delivered`.
   */
  @Column({ default: false })
  paid: boolean;

  /** Denormalised snapshot of every line item at the time of checkout. */
  @Column('jsonb')
  items: OrderItem[];

  /** Sum of (price × qty) for all items, in ETB. */
  @Column('int')
  subtotal: number;

  /** Delivery fee in ETB (0 when the order qualifies for free shipping). */
  @Column('int')
  shipping: number;

  /** Final amount charged: subtotal + shipping. */
  @Column('int')
  total: number;

  @Column({ type: 'varchar', default: 'placed' })
  @Index()
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  /** Chapa payment checkout URL (for online payments) */
  @Column({ type: 'text', nullable: true })
  paymentUrl: string;

  /** Chapa transaction reference */
  @Column({ type: 'varchar', nullable: true })
  @Index()
  txRef: string;

  /** Payment status for online payments */
  @Column({ type: 'varchar', nullable: true })
  paymentStatus: 'pending' | 'success' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
