import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createAcknowledgmentXml } from '../core/xml';

/**
 * Interceptor that automatically converts the handler's response
 * to the XML acknowledgment expected by Payin-Payout.
 *
 * If the handler returns { acknowledged: true }, the response will be:
 * - Content-Type: application/xml
 * - Body: <?xml version="1.0" encoding="UTF-8"?><response><result>0</result></response>
 * - HTTP 200
 */
@Injectable()
export class PayinWebhookInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
    return next.handle().pipe(
      map((data: { acknowledged?: boolean }) => {
        const response = context.switchToHttp().getResponse();

        if (data?.acknowledged) {
          response.header('Content-Type', 'application/xml');
          return createAcknowledgmentXml();
        }

        response.status(400);
        response.header('Content-Type', 'text/plain');
        return 'Not acknowledged';
      }),
    );
  }
}
