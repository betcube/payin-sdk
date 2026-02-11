export interface GetPaymentMethodsRequest {
  /** Format: "HH:mm:SS dd.MM.yyyy" */
  agentTime: string;
}

export interface PaymentMethod {
  id: number;
  slug: string;
  title: string;
  name: string;
  hg_id: number;
  icon: string;
  big_icon: string | null;
  preference: number;
  descr: string | null;
  special: number;
  non_interactive: boolean;
  disabled: boolean;
  enabled: boolean;
  enable: boolean;
}

export type GetPaymentMethodsResponse = PaymentMethod[];
