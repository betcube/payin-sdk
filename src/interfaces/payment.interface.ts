import type { Currency, PaymentPreference, ProductUnit, DiscountType } from './common.types';

export interface ProductDiscount {
  type: DiscountType;
  value: number;
}

export interface PurchaseProduct {
  name: string;
  price: number;
  quantity: number;
  vat: number;
  unit: ProductUnit;
  discount?: ProductDiscount;
}

export interface Purchase {
  products: PurchaseProduct[];
}

export interface CreatePaymentRequest {
  orderId: string;
  agentName: string;
  userName?: string;
  amount: number;
  goods: string;
  currency?: Currency;
  email: string;
  phone: string;
  preference?: PaymentPreference | number;
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  agentTime: string;
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  limitTime?: string;
  successUrl?: string;
  failUrl?: string;
  shopUrl?: string;
  addInfo?: Record<number, string>;
  clientId?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  token?: string;
  purchase?: Purchase;
  nspkUrl?: string;
}

export interface CreatePaymentResponse {
  redirectUrl: string;
}
