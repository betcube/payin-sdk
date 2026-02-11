export const PaymentStatus = {
  SUCCESS: 1,
  ERROR: 2,
  PARTIAL: 3,
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentPreference = {
  NOT_SPECIFIED: 0,
  PAYIN_PAYOUT_ACCOUNT: 1,
  QIWI_TERMINALS: 2,
  BANK_TRANSFER_RU: 5,
  YANDEX_MONEY: 6,
  BANK_TRANSFER_SWIFT: 7,
  QIWI_WALLET: 8,
  RBK_MONEY: 13,
  WALLET_ONE: 14,
  PAYPAL: 15,
  PLASTIC_CARDS: 22,
  ELEKSNET_TERMINALS: 124,
  PLASTIC_CARDS_ALT: 125,
  ALFA_CLICK: 126,
  SMS_MTS_MEGAFON_TELE2: 127,
  SMS_BEELINE: 128,
  WEBMONEY: 129,
  EUROSET_MTS_SALONS: 130,
  RECURRING: 133,
  SBP: 136,
} as const;
export type PaymentPreference = (typeof PaymentPreference)[keyof typeof PaymentPreference];

export const Currency = {
  RUR: 'RUR',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
  UAH: 'UAH',
  KZT: 'KZT',
  MDL: 'MDL',
  BYN: 'BYN',
  TRY: 'TRY',
  AED: 'AED',
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export const P2PType = {
  ANY: 'ANY',
  SBP: 'SBP',
  SBP_TG: 'SBP_TG',
} as const;
export type P2PType = (typeof P2PType)[keyof typeof P2PType];

export const ProductUnit = {
  PIECE: 'piece',
  KG: 'kg',
  GRAM: 'g',
  LITER: 'L',
  ML: 'ml',
} as const;
export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit];

export const DiscountType = {
  AMOUNT: 'amount',
  PERCENT: 'percent',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];
