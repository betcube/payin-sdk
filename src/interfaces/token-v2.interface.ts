export interface CreateTokenV2Request {
  /** Payment method (22, 125, or 133) */
  preference: number;
  /** Redirect URL on token confirmation */
  successUrl: string;
  /** Redirect URL on cancellation */
  cancelUrl: string;
  /** Webhook URL for token confirmation */
  callbackUrl?: string;
  currency?: string;
  /** Temporary charge amount for verification */
  amount?: number;
  email?: string;
}

export interface CreateTokenV2Result {
  token: string;
  client_redirect_url: string;
  error?: string;
}

export interface CreateTokenV2Response {
  status: boolean;
  result: CreateTokenV2Result;
}

export interface TokenV2StatusRequest {
  /** Payment method (22, 125, or 133) */
  preference: number;
  token: string;
}

export interface TokenV2StatusResult {
  token: string;
  /** 'SUCCEEDED' or 'not confirmed' */
  status: string;
  error?: string;
}

export interface TokenV2StatusResponse {
  status: boolean;
  result: TokenV2StatusResult;
}
