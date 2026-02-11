export interface CreateTokenV1Request {
  /** Order ID of the successful payment */
  orderId: string;
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  agentTime: string;
}

export interface CreateTokenV1Response {
  status: boolean;
  /** Token string on success, error message on failure */
  result: string;
}

export interface TokenV1PaymentRequest {
  orderId: string;
  agentName: string;
  userName?: string;
  amount: number;
  goods: string;
  currency?: string;
  email: string;
  phone: string;
  /** Payment method (125 for plastic cards) */
  preference: number;
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  agentTime: string;
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  limitTime?: string;
  successUrl?: string;
  failUrl?: string;
  shopUrl?: string;
  addInfo?: Record<number, string>;
  clientId?: string;
  token: string;
}

export interface TokenV1PaymentResponse {
  status: boolean;
  result: string;
  /** Present when 3DS verification is required */
  url?: string;
}
