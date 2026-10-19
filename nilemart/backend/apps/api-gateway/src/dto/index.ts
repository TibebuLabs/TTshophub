import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CATEGORIES, CITIES } from '@app/common';

// ─── Shared regex patterns ────────────────────────────────────────────────────

/** Matches Ethiopian phone numbers: 09XXXXXXXX, 07XXXXXXXX, +251XXXXXXXXX. */
const PHONE = /^(\+251|0)?[79]\d{8}$/;

/** Password must be at least 8 characters with at least one letter and one digit. */
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @Matches(PHONE, { message: 'Enter a valid Ethiopian phone number' })
  phone: string;

  @Matches(PASSWORD, { message: 'Password needs 8+ characters with a letter and a number' })
  password: string;

  // No role or adminCode - always registers as customer
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // Role is automatically detected from database - no role parameter needed
}

export class ProfileDto {
  @IsString()
  @MinLength(3)
  name: string;

  @Matches(PHONE, { message: 'Enter a valid Ethiopian phone number' })
  phone: string;
}

export class PasswordDto {
  @IsString()
  current: string;

  @Matches(PASSWORD, { message: 'Password needs 8+ characters with a letter and a number' })
  next: string;
}

// ─── Product DTOs ─────────────────────────────────────────────────────────────

export class ProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  nameAm?: string;

  @IsIn(CATEGORIES as unknown as string[])
  category: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  images: string[];

  @IsInt()
  @Min(1)
  price: number;

  @IsInt()
  @Min(1)
  oldPrice: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @MinLength(2)
  seller: string | undefined;

  @IsOptional()
  @IsString()
  description?: string;
}

/** Partial version of ProductDto — all fields are optional for PATCH requests. */
export class UpdateProductDto extends PartialType(ProductDto) {}

// ─── Order DTOs ───────────────────────────────────────────────────────────────

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @MinLength(3)
  customerName: string;

  @Matches(PHONE, { message: 'Enter a valid Ethiopian phone number' })
  phone: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsIn(Object.keys(CITIES))
  city: string;

  @IsIn(['cod', 'telebirr', 'cbe', 'chapa', 'bank', 'mpesa', 'ebirr'], {
    message: 'Payment method must be cod, telebirr, cbe, chapa, bank, mpesa, or ebirr',
  })
  payment: string | undefined;
}

// ─── Admin user management DTOs ───────────────────────────────────────────────

export class AdminCreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @Matches(PHONE, { message: 'Enter a valid Ethiopian phone number' })
  phone: string;

  @IsIn(['customer', 'admin'])
  role: 'customer' | 'admin';

  @IsOptional()
  @Matches(PASSWORD)
  password?: string;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @Matches(PHONE)
  phone?: string;

  @IsOptional()
  @IsIn(['customer', 'admin'])
  role?: 'customer' | 'admin';
}

export class SuspendDto {
  @IsBoolean()
  suspended: boolean;
}
