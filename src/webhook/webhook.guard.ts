import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PayinWebhookService } from './webhook.service';

@Injectable()
export class PayinWebhookGuard implements CanActivate {
  constructor(private readonly webhookService: PayinWebhookService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body: Record<string, string> = request.body;

    if (!body || !body.sign) {
      throw new ForbiddenException('Missing signature');
    }

    const notification = this.webhookService.parseNotification(body);
    const isValid = this.webhookService.verifySignature(notification);

    if (!isValid) {
      throw new ForbiddenException('Invalid signature');
    }

    return true;
  }
}
