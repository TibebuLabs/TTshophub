import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// ─── Notification entity ──────────────────────────────────────────────────────
//
// Lives in the local `notify` or Supabase `shophub_notify` schema.
//
// Every notification targets either all admin users (`audience: 'admin'`) or
// a specific customer (`audience: 'user'`, `userId` set).
//

@Entity('notifications')
@Index(['userId', 'read', 'createdAt'])
@Index(['audience', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Who should see this notification: the admin panel or a specific customer. */
  @Column({ type: 'varchar' })
  @Index()
  audience: 'admin' | 'user';

  /** Set when `audience` is `'user'` to target a specific customer. */
  @Column({ type: 'varchar', nullable: true })
  @Index()
  userId: string | null;

  /** Event type tag (e.g. `'order'`, `'status'`, `'stock'`, `'user'`). */
  @Column()
  type: string;

  /** Short summary shown as the notification heading. */
  @Column()
  title: string;

  /** Optional longer description below the title. */
  @Column({ default: '' })
  body: string;

  /** Related order ID (when the notification is order-related). */
  @Column({ type: 'varchar', nullable: true })
  orderId: string | null;

  /** Whether the recipient has opened the notification panel. */
  @Column({ default: false })
  @Index()
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
