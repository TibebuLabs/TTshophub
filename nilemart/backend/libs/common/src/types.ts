/** User roles in the system */
export type Role = 'customer' | 'admin';

/** Supported payment methods */
export type PaymentMethod =
  | 'telebirr'
  | 'cbe'
  | 'chapa'
  | 'cod'
  | 'bank'
  | 'mpesa'
  | 'ebirr';

/** Lifecycle states an order can be in */
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/** Shape of the JWT payload after verification */
export interface JwtUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

/** A single line item stored inside an order document */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}
