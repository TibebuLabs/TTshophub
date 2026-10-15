import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A product listed in the ShopHub catalog.
 * Stored in the local `catalog` schema or Supabase `shophub_catalog` schema.
 */
@Entity('products')
@Index(['category', 'price'])
@Index(['createdAt'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  /** Amharic translation of the product name (optional). */
  @Column({ default: '' })
  nameAm: string;

  @Column()
  @Index()
  category: string;

  /** Public Supabase Storage URLs shown on product cards and detail pages. */
  @Column('text', { array: true, default: '{}' })
  images: string[];

  /** Current selling price in ETB. */
  @Column('int')
  @Index()
  price: number;

  /** Original / crossed-out price in ETB (used to compute discount %). */
  @Column('int')
  oldPrice: number;

  /** Units available; decremented on reserve, incremented on release. */
  @Column('int', { default: 0 })
  stock: number;

  /** Display name of the seller / vendor. */
  @Column()
  seller: string;

  @Column({ default: '' })
  description: string;

  @Column('text', { default: '' })
  descriptionAm: string;

  /** Average star rating (1–5). */
  @Column('float', { default: 4 })
  rating: number;

  /** Total number of ratings that contributed to `rating`. */
  @Column('int', { default: 0 })
  ratingCount: number;

  /** Soft-delete: inactive products are hidden from the storefront. */
  @Column({ default: true })
  active: boolean;

  /** Whether this product appears in the featured / flash-deal section. */
  @Column({ default: false })
  featured: boolean;

  @Column('simple-array', { default: '' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
