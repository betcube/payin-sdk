import { Injectable, Inject } from '@nestjs/common';
import { PAYIN_MODULE_OPTIONS } from '../payin.constants';
import type { PayinModuleOptions } from '../interfaces/payin-module-options.interface';
import type { PaymentNotification } from '../interfaces/webhook.interface';
import { verifyNotificationSign } from '../core/signature';
import { parseAddInfo } from '../utils/form-data';

@Injectable()
export class PayinWebhookService {
  constructor(
    @Inject(PAYIN_MODULE_OPTIONS) private readonly options: PayinModuleOptions,
  ) {}

  /** Verify the MD5 signature of a payment notification */
  verifySignature(notification: PaymentNotification): boolean {
    return verifyNotificationSign(notification, this.options.secret);
  }

  /** Parse raw form data (Record<string, string>) into a typed PaymentNotification */
  parseNotification(data: Record<string, string>): PaymentNotification {
    return {
      agentId: Number(data.agentId),
      orderId: data.orderId,
      paymentId: Number(data.paymentId),
      amount: Number(data.amount),
      currency: data.currency || undefined,
      phone: data.phone,
      preference: Number(data.preference),
      paymentStatus: Number(data.paymentStatus) as 1 | 2 | 3,
      paymentDate: data.paymentDate,
      goods: data.goods,
      agentName: data.agentName,
      sign: data.sign,
      comment: data.comment ? decodeURIComponent(data.comment) : undefined,
      addInfo: parseAddInfo(data),
    };
  }
}
