import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A customer review for a product.
 * Stored alongside products in the local `catalog` or Supabase `shophub_catalog` schema.
 */
@Entity('reviews')
@Index(['productId', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  productId: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  userName: string;

  /** Star rating from 1 to 5. */
  @Column('int')
  rating: number;

  @Column('text', { default: '' })
  comment: string;

  /** True when the reviewer actually purchased this product. */
  @Column({ default: false })
  verified: boolean;

  /** URLs of images attached to this review. */
  @Column('simple-array', { default: '' })
  images: string[];

  /** Number of users who found this review helpful. */
  @Column({ default: 0 })
  helpfulCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
