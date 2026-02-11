import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { PayinWebhookGuard } from '../src/webhook/webhook.guard';
import { PayinWebhookService } from '../src/webhook/webhook.service';
import { signNotification } from '../src/core/signature';

const SECRET = 'test-secret';

function createMockWebhookService(): PayinWebhookService {
  return new PayinWebhookService({ agentId: 8686, secret: SECRET });
}

function createMockContext(body: Record<string, string>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ body }),
    }),
  } as any;
}

describe('PayinWebhookGuard', () => {
  it('should allow request with valid signature', () => {
    const service = createMockWebhookService();
    const guard = new PayinWebhookGuard(service);

    const sign = signNotification({
      agentId: 8686,
      orderId: '12345',
      paymentId: 99999,
      amount: 100,
      phone: '+79161234567',
      paymentStatus: 1,
      paymentDate: '14:30:00 01.01.2024',
      secret: SECRET,
    });

    const body = {
      agentId: '8686',
      orderId: '12345',
      paymentId: '99999',
      amount: '100',
      phone: '+79161234567',
      preference: '125',
      paymentStatus: '1',
      paymentDate: '14:30:00 01.01.2024',
      goods: 'Test product',
      agentName: 'Test store',
      sign,
    };

    const result = guard.canActivate(createMockContext(body));
    expect(result).toBe(true);
  });

  it('should reject request with invalid signature', () => {
    const service = createMockWebhookService();
    const guard = new PayinWebhookGuard(service);

    const body = {
      agentId: '8686',
      orderId: '12345',
      paymentId: '99999',
      amount: '100',
      phone: '+79161234567',
      preference: '125',
      paymentStatus: '1',
      paymentDate: '14:30:00 01.01.2024',
      goods: 'Test product',
      agentName: 'Test store',
      sign: 'invalidsignature',
    };

    expect(() => guard.canActivate(createMockContext(body))).toThrow(
      ForbiddenException,
    );
  });

  it('should reject request without sign field', () => {
    const service = createMockWebhookService();
    const guard = new PayinWebhookGuard(service);

    const body = {
      agentId: '8686',
      orderId: '12345',
    };

    expect(() => guard.canActivate(createMockContext(body))).toThrow(
      ForbiddenException,
    );
  });

  it('should reject request with empty body', () => {
    const service = createMockWebhookService();
    const guard = new PayinWebhookGuard(service);

    expect(() => guard.canActivate(createMockContext(null as any))).toThrow(
      ForbiddenException,
    );
  });
});
