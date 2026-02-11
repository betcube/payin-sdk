export interface PayinModuleOptions {
  /** Merchant agent ID (1-999999) */
  agentId: number;
  /** Secret key from merchant admin panel */
  secret: string;
  /** Use sandbox environment (dev1.payin-payout.net). Default: false */
  sandbox?: boolean;
  /** Custom base URL. Overrides sandbox flag */
  baseUrl?: string;
  /** Request timeout in ms. Default: 30000 */
  timeout?: number;
}

export interface PayinModuleAsyncOptions {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => PayinModuleOptions | Promise<PayinModuleOptions>;
  inject?: any[];
}
