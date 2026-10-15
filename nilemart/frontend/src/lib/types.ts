/** Product list item used across the storefront and admin views. */
export interface Product {
  id: string;
  name: string;
  nameAm: string;
  category: string;
  images?: string[];
  price: number;
  oldPrice: number;
  stock: number;
  seller: string;
  description: string;
  rating: number;
  ratingCount: number;
  featured?: boolean;
}

/** Authenticated account details for the signed-in customer or staff member. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  suspended: boolean;
  createdAt: string;
  orders?: number;
  spent?: number;
}

/** A single line item within a customer's order. */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

/** Full order snapshot used in the checkout and account history. */
export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
  paid: boolean;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
}

/** Notification bubble on the storefront or dashboard. */
export interface Notif {
  id: string;
  audience: string;
  type: string;
  title: string;
  body: string;
  orderId: string | null;
  read: boolean;
  createdAt: string;
}

/** Runtime configuration loaded from the API gateway. */
export interface AppConfig {
  categories: string[];
  cities: Record<string, { fee: number; eta: string }>;
  freeShippingOver: number;
}

/** A cart row tied to a product and selected quantity. */
export interface CartLine {
  product: Product;
  qty: number;
}
