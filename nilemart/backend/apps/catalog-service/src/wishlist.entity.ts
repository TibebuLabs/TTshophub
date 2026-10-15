import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * A saved product in a customer's wishlist, stored in the catalog schema.
 * The compound unique index ensures a user can only save a product once.
 */
@Entity('wishlists')
@Index(['userId', 'productId'], { unique: true })
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  productId: string;

  @CreateDateColumn()
  createdAt: Date;
}
