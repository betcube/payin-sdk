import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { PaymentNotification } from '../interfaces/webhook.interface';
import { parseAddInfo } from '../utils/form-data';

/**
 * Parameter decorator that extracts and parses the webhook body
 * into a typed PaymentNotification object.
 *
 * Usage:
 * ```
 * @Post('webhook')
 * @UseGuards(PayinWebhookGuard)
 * @UseInterceptors(PayinWebhookInterceptor)
 * handle(@PayinWebhook() notification: PaymentNotification) { ... }
 * ```
 */
export const PayinWebhook = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PaymentNotification => {
    const request = ctx.switchToHttp().getRequest();
    const body: Record<string, string> = request.body;

    return {
      agentId: Number(body.agentId),
      orderId: body.orderId,
      paymentId: Number(body.paymentId),
      amount: Number(body.amount),
      currency: body.currency || undefined,
      phone: body.phone,
      preference: Number(body.preference),
      paymentStatus: Number(body.paymentStatus) as 1 | 2 | 3,
      paymentDate: body.paymentDate,
      goods: body.goods,
      agentName: body.agentName,
      sign: body.sign,
      comment: body.comment ? decodeURIComponent(body.comment) : undefined,
      addInfo: parseAddInfo(body),
    };
  },
);
