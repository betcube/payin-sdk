import type { PaymentStatus } from './common.types';

export interface PaymentNotification {
  agentId: number;
  orderId: string;
  paymentId: number;
  amount: number;
  currency?: string;
  phone: string;
  preference: number;
  paymentStatus: PaymentStatus;
  /** Format: "HH:mm:SS dd.MM.YYYY" */
  paymentDate: string;
  goods: string;
  agentName: string;
  sign: string;
  comment?: string;
  addInfo?: Record<number, string>;
}

export interface WebhookResult {
  acknowledged: boolean;
}
