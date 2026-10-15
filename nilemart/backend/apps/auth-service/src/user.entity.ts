import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@app/common';

/**
 * Persistent user record stored in the `auth` schema.
 *
 * The `passwordHash` column is excluded from `SELECT` queries by default
 * (`select: false`) so it never leaks in list responses. Load it explicitly
 * when you need to verify a password.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  /** Normalised to lower-case on write; unique + indexed for fast lookup. */
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  phone: string;

  /** Bcrypt hash — never returned to callers via `pub()`. */
  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'varchar', default: 'customer' })
  @Index()
  role: Role;

  /** When true, the user cannot sign in or be included in session checks. */
  @Column({ default: false })
  suspended: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  /** Optional profile picture URL. */
  @Column({ nullable: true })
  avatar: string;

  /** Home city used for pre-filling the checkout form. */
  @Column({ default: '' })
  city: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
