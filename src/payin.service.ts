import { Injectable, Inject } from '@nestjs/common';
import { PAYIN_MODULE_OPTIONS } from './payin.constants';
import type { PayinModuleOptions } from './interfaces/payin-module-options.interface';
import { PayinHttpClient } from './core/http.client';
import * as sig from './core/signature';
import { flattenPurchase, flattenAddInfo } from './utils/form-data';
import { PayinApiError } from './errors/payin.errors';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
} from './interfaces/payment.interface';
import type {
  GetPaymentMethodsRequest,
  PaymentMethod,
} from './interfaces/payment-methods.interface';
import type {
  CreateTokenV1Request,
  CreateTokenV1Response,
  TokenV1PaymentRequest,
  TokenV1PaymentResponse,
} from './interfaces/token-v1.interface';
import type {
  CreateTokenV2Request,
  CreateTokenV2Response,
  TokenV2StatusRequest,
  TokenV2StatusResponse,
} from './interfaces/token-v2.interface';
import type {
  CreateTerminalInvoiceRequest,
  CreateTerminalInvoiceResponse,
  CreateP2PInvoiceRequest,
  P2PInvoiceResponse,
  P2PInvoiceErrorResponse,
} from './interfaces/invoice.interface';

@Injectable()
export class PayinService {
  constructor(
    @Inject(PAYIN_MODULE_OPTIONS) private readonly options: PayinModuleOptions,
    private readonly http: PayinHttpClient,
  ) {}

  /**
   * Register a payment. Returns a redirect URL that the user's
   * browser should be directed to for payment completion.
   */
  async createPayment(
    req: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    const amount = req.amount.toFixed(2);
    const sign = sig.signPayment({
      agentId: this.options.agentId,
      orderId: req.orderId,
      agentTime: req.agentTime,
      amount,
      phone: req.phone,
      token: req.token,
      secret: this.options.secret,
    });

    const formData = this.buildPaymentFormData(req, amount, sign);

    const response = await this.http.postForm<never>('/api/shop', formData, {
      expectRedirect: true,
    });

    return { redirectUrl: response.redirectUrl! };
  }

  /** Get available payment methods for the store */
  async getPaymentMethods(
    req: GetPaymentMethodsRequest,
  ): Promise<PaymentMethod[]> {
    const sign = sig.signGetProviders({
      agentId: this.options.agentId,
      agentTime: req.agentTime,
      secret: this.options.secret,
    });

    const response = await this.http.postForm<PaymentMethod[]>(
      '/shop/get-providers-pay',
      {
        agentId: String(this.options.agentId),
        agentTime: req.agentTime,
        sign,
      },
    );

    return response.data;
  }

  /** Create a token from a successful payment (V1 — without 3DS) */
  async createTokenV1(
    req: CreateTokenV1Request,
  ): Promise<CreateTokenV1Response> {
    const sign = sig.signTokenV1Create({
      agentId: this.options.agentId,
      orderId: req.orderId,
      agentTime: req.agentTime,
      secret: this.options.secret,
    });

    const response = await this.http.postForm<CreateTokenV1Response>(
      '/api/rpay/token',
      {
        agentId: String(this.options.agentId),
        orderId: req.orderId,
        agentTime: req.agentTime,
        sign,
      },
    );

    return response.data;
  }

  /** Execute a recurring payment using token V1 */
  async payWithTokenV1(
    req: TokenV1PaymentRequest,
  ): Promise<TokenV1PaymentResponse> {
    const amount = req.amount.toFixed(2);
    const sign = sig.signTokenV1Pay({
      agentId: this.options.agentId,
      orderId: req.orderId,
      agentTime: req.agentTime,
      amount,
      phone: req.phone,
      token: req.token,
      secret: this.options.secret,
    });

    const formData = this.buildTokenV1PayFormData(req, amount, sign);

    const response = await this.http.postForm<TokenV1PaymentResponse>(
      '/api/rpay/pay',
      formData,
    );

    return response.data;
  }

  /** Create a token V2 (with 3DS support). Returns redirect URL for user confirmation. */
  async createTokenV2(
    req: CreateTokenV2Request,
  ): Promise<CreateTokenV2Response> {
    const sign = sig.signTokenV2({
      agentId: this.options.agentId,
      preference: req.preference,
      secret: this.options.secret,
    });

    const formData: Record<string, string> = {
      agentId: String(this.options.agentId),
      preference: String(req.preference),
      successUrl: req.successUrl,
      cancelUrl: req.cancelUrl,
      sign,
    };
    if (req.callbackUrl) formData.callbackUrl = req.callbackUrl;
    if (req.currency) formData.currency = req.currency;
    if (req.amount !== undefined) formData.amount = req.amount.toFixed(2);
    if (req.email) formData.email = req.email;

    const response = await this.http.postForm<CreateTokenV2Response>(
      '/api/rpay/get-token',
      formData,
    );

    return response.data;
  }

  /** Check token V2 confirmation status */
  async getTokenV2Status(
    req: TokenV2StatusRequest,
  ): Promise<TokenV2StatusResponse> {
    const sign = sig.signTokenV2({
      agentId: this.options.agentId,
      preference: req.preference,
      secret: this.options.secret,
    });

    const response = await this.http.postForm<TokenV2StatusResponse>(
      '/api/rpay/get-status-token',
      {
        agentId: String(this.options.agentId),
        preference: String(req.preference),
        token: req.token,
        sign,
      },
    );

    return response.data;
  }

  /** Create an invoice for terminal payment */
  async createTerminalInvoice(
    req: CreateTerminalInvoiceRequest,
  ): Promise<CreateTerminalInvoiceResponse> {
    const amount = req.amount.toFixed(2);
    const sign = sig.signPayment({
      agentId: this.options.agentId,
      orderId: req.orderId,
      agentTime: req.agentTime,
      amount,
      phone: req.phone,
      token: req.token,
      secret: this.options.secret,
    });

    const formData = this.buildPaymentFormData(req, amount, sign);
    formData.format = 'json';

    const response =
      await this.http.postForm<CreateTerminalInvoiceResponse>(
        '/api/shop',
        formData,
      );

    return response.data;
  }

  /** Create a P2P transfer invoice (card-to-card or SBP) */
  async createP2PInvoice(
    req: CreateP2PInvoiceRequest,
  ): Promise<P2PInvoiceResponse> {
    const amount = req.amount.toFixed(2);
    const sign = sig.signPayment({
      agentId: this.options.agentId,
      orderId: req.orderId,
      agentTime: req.agentTime,
      amount,
      phone: req.phone,
      token: req.token,
      secret: this.options.secret,
    });

    const formData = this.buildPaymentFormData(req, amount, sign);
    formData.json = '1';
    formData.p2p_type = req.p2pType;
    if (req.senderName) formData.sender_name = req.senderName;

    const response = await this.http.postForm<
      P2PInvoiceResponse | P2PInvoiceErrorResponse
    >('/api/shop', formData);

    if ('status' in response.data && (response.data as any).status === false) {
      throw new PayinApiError(
        (response.data as P2PInvoiceErrorResponse).user_msg,
        200,
        JSON.stringify(response.data),
      );
    }

    return response.data as P2PInvoiceResponse;
  }

  private buildPaymentFormData(
    req: CreatePaymentRequest,
    amount: string,
    sign: string,
  ): Record<string, string> {
    const form: Record<string, string> = {
      agentId: String(this.options.agentId),
      orderId: req.orderId,
      agentName: req.agentName,
      amount,
      goods: req.goods,
      email: req.email,
      phone: req.phone,
      agentTime: req.agentTime,
      sign,
    };

    if (req.userName) form.userName = req.userName;
    if (req.currency) form.currency = req.currency;
    if (req.preference !== undefined) form.preference = String(req.preference);
    if (req.limitTime) form.limitTime = req.limitTime;
    if (req.successUrl) form.successUrl = req.successUrl;
    if (req.failUrl) form.failUrl = req.failUrl;
    if (req.shopUrl) form.shop_url = req.shopUrl;
    if (req.clientId) form.clientId = req.clientId;
    if (req.firstName) form.firstName = req.firstName;
    if (req.lastName) form.lastName = req.lastName;
    if (req.addressLine1) form.addressLine1 = req.addressLine1;
    if (req.addressLine2) form.addressLine2 = req.addressLine2;
    if (req.city) form.city = req.city;
    if (req.state) form.state = req.state;
    if (req.country) form.country = req.country;
    if (req.token) form.token = req.token;
    if (req.nspkUrl) form.nspkUrl = req.nspkUrl;

    if (req.addInfo) Object.assign(form, flattenAddInfo(req.addInfo));
    if (req.purchase) Object.assign(form, flattenPurchase(req.purchase));

    return form;
  }

  private buildTokenV1PayFormData(
    req: TokenV1PaymentRequest,
    amount: string,
    sign: string,
  ): Record<string, string> {
    const form: Record<string, string> = {
      agentId: String(this.options.agentId),
      orderId: req.orderId,
      agentName: req.agentName,
      amount,
      goods: req.goods,
      email: req.email,
      phone: req.phone,
      preference: String(req.preference),
      agentTime: req.agentTime,
      token: req.token,
      sign,
    };

    if (req.userName) form.userName = req.userName;
    if (req.currency) form.currency = req.currency;
    if (req.limitTime) form.limitTime = req.limitTime;
    if (req.successUrl) form.successUrl = req.successUrl;
    if (req.failUrl) form.failUrl = req.failUrl;
    if (req.shopUrl) form.shop_url = req.shopUrl;
    if (req.clientId) form.clientId = req.clientId;
    if (req.addInfo) Object.assign(form, flattenAddInfo(req.addInfo));

    return form;
  }
}
