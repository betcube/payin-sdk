import type { CreatePaymentRequest } from './payment.interface';
import type { P2PType } from './common.types';

export type CreateTerminalInvoiceRequest = CreatePaymentRequest;

export interface TerminalInvoiceResult {
  number: string;
  payment_id: string;
}

export interface CreateTerminalInvoiceResponse {
  status: boolean;
  result: TerminalInvoiceResult;
}

export interface CreateP2PInvoiceRequest extends CreatePaymentRequest {
  p2pType: P2PType;
  senderName?: string;
}

export interface P2PInvoiceCardResponse {
  amount: number;
  orderId: string;
  number: string;
  until: string;
  cardNumber: string;
}

export interface P2PInvoiceSbpResponse {
  amount: number;
  orderId: string;
  number: string;
  until: string;
  receiverName: string;
  receiverBank: string;
  receiverPhone: string;
}

export type P2PInvoiceResponse = P2PInvoiceCardResponse | P2PInvoiceSbpResponse;

export interface P2PInvoiceErrorResponse {
  status: false;
  user_msg: string;
}
