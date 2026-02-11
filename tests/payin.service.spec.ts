import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayinService } from '../src/payin.service';
import { PayinHttpClient } from '../src/core/http.client';

const OPTIONS = {
  agentId: 8686,
  secret: 'test-secret',
  sandbox: true,
};

describe('PayinService', () => {
  let service: PayinService;
  let mockHttp: { postForm: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockHttp = {
      postForm: vi.fn(),
    };
    service = new PayinService(OPTIONS, mockHttp as any);
  });

  describe('createPayment', () => {
    it('should call postForm with correct path and form data', async () => {
      mockHttp.postForm.mockResolvedValue({
        status: 302,
        redirectUrl: 'https://lk.payin-payout.net/payment/123',
      });

      const result = await service.createPayment({
        orderId: '12345',
        agentName: 'Test Store',
        amount: 150.5,
        goods: 'Test Product',
        email: 'test@example.com',
        phone: '+79161234567',
        agentTime: '14:30:00 07.02.2026',
      });

      expect(mockHttp.postForm).toHaveBeenCalledWith(
        '/api/shop',
        expect.objectContaining({
          agentId: '8686',
          orderId: '12345',
          agentName: 'Test Store',
          amount: '150.50',
          goods: 'Test Product',
          email: 'test@example.com',
          phone: '+79161234567',
          agentTime: '14:30:00 07.02.2026',
        }),
        { expectRedirect: true },
      );

      expect(result.redirectUrl).toBe(
        'https://lk.payin-payout.net/payment/123',
      );
    });

    it('should include sign in form data', async () => {
      mockHttp.postForm.mockResolvedValue({
        status: 302,
        redirectUrl: 'https://example.com',
      });

      await service.createPayment({
        orderId: '12345',
        agentName: 'Test Store',
        amount: 150.5,
        goods: 'Test Product',
        email: 'test@example.com',
        phone: '+79161234567',
        agentTime: '14:30:00 07.02.2026',
      });

      const formData = mockHttp.postForm.mock.calls[0][1];
      expect(formData.sign).toBeDefined();
      expect(formData.sign).toHaveLength(32); // MD5 hex is 32 chars
    });
  });

  describe('getPaymentMethods', () => {
    it('should call postForm with correct path', async () => {
      const mockResponse = [
        {
          id: 3,
          slug: 'cards',
          title: 'Cards',
          preference: 125,
        },
      ];

      mockHttp.postForm.mockResolvedValue({ status: 200, data: mockResponse });

      const result = await service.getPaymentMethods({
        agentTime: '14:30:00 07.02.2026',
      });

      expect(mockHttp.postForm).toHaveBeenCalledWith(
        '/shop/get-providers-pay',
        expect.objectContaining({
          agentId: '8686',
          agentTime: '14:30:00 07.02.2026',
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createTokenV1', () => {
    it('should call postForm with correct path and params', async () => {
      const mockResponse = { status: true, result: 'token123' };
      mockHttp.postForm.mockResolvedValue({ status: 200, data: mockResponse });

      const result = await service.createTokenV1({
        orderId: '12345',
        agentTime: '14:30:00 07.02.2026',
      });

      expect(mockHttp.postForm).toHaveBeenCalledWith(
        '/api/rpay/token',
        expect.objectContaining({
          agentId: '8686',
          orderId: '12345',
          agentTime: '14:30:00 07.02.2026',
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createTerminalInvoice', () => {
    it('should include format=json in form data', async () => {
      const mockResponse = {
        status: true,
        result: { number: '007978-000367', payment_id: '64409489281234' },
      };
      mockHttp.postForm.mockResolvedValue({ status: 200, data: mockResponse });

      await service.createTerminalInvoice({
        orderId: '12345',
        agentName: 'Test Store',
        amount: 100,
        goods: 'Test',
        email: 'test@example.com',
        phone: '+79161234567',
        agentTime: '14:30:00 07.02.2026',
      });

      const formData = mockHttp.postForm.mock.calls[0][1];
      expect(formData.format).toBe('json');
    });
  });

  describe('createP2PInvoice', () => {
    it('should include json=1 and p2p_type in form data', async () => {
      const mockResponse = {
        amount: 600,
        orderId: '1003',
        number: '007026-000271',
        until: '2023-07-12 01:57:48+0000',
        cardNumber: '2201112223334455',
      };
      mockHttp.postForm.mockResolvedValue({ status: 200, data: mockResponse });

      await service.createP2PInvoice({
        orderId: '1003',
        agentName: 'Test Store',
        amount: 600,
        goods: 'P2P Transfer',
        email: 'test@example.com',
        phone: '+79161234567',
        agentTime: '14:30:00 07.02.2026',
        p2pType: 'ANY',
        clientId: 'client123',
      });

      const formData = mockHttp.postForm.mock.calls[0][1];
      expect(formData.json).toBe('1');
      expect(formData.p2p_type).toBe('ANY');
    });

    it('should throw PayinApiError on P2P error response', async () => {
      const errorResponse = {
        status: false,
        user_msg: 'Error: Error! OrderId already exists.',
      };
      mockHttp.postForm.mockResolvedValue({
        status: 200,
        data: errorResponse,
      });

      await expect(
        service.createP2PInvoice({
          orderId: '1003',
          agentName: 'Test Store',
          amount: 600,
          goods: 'P2P Transfer',
          email: 'test@example.com',
          phone: '+79161234567',
          agentTime: '14:30:00 07.02.2026',
          p2pType: 'ANY',
          clientId: 'client123',
        }),
      ).rejects.toThrow('Error: Error! OrderId already exists.');
    });
  });
});
