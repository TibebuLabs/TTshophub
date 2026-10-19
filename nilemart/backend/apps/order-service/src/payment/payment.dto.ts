import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  orderCode: string;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  txRef: string;
}

export class ChapaWebhookDto {
  tx_ref: string;
  status: string;
  amount: string;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  charge: string;
  mode: string;
  method: string;
  type: string;
  created_at: string;
  updated_at: string;
}
