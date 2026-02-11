import { describe, it, expect } from 'vitest';
import {
  md5,
  signPayment,
  signNotification,
  signGetProviders,
  signTokenV1Create,
  signTokenV1Pay,
  signTokenV2,
  verifyNotificationSign,
} from '../src/core/signature';

describe('md5', () => {
  it('should compute correct MD5 hash', () => {
    expect(md5('test')).toBe('098f6bcd4621d373cade4e832627b4f6');
  });

  it('should compute correct MD5 for empty string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
});

describe('signPayment', () => {
  it('should generate correct signature without token', () => {
    const secret = 'mysecret';
    const result = signPayment({
      agentId: 8686,
      orderId: '87876',
      agentTime: '13:12:03 10.01.2010',
      amount: '166.70',
      phone: '+79090000001',
      secret,
    });

    // MD5(8686#87876#13:12:03 10.01.2010#166.70#+79090000001#MD5(mysecret))
    const secretMd5 = md5(secret);
    const expected = md5(
      `8686#87876#13:12:03 10.01.2010#166.70#+79090000001#${secretMd5}`,
    );
    expect(result).toBe(expected);
  });

  it('should generate correct signature with token', () => {
    const secret = 'mysecret';
    const token = 'sometoken123';
    const result = signPayment({
      agentId: 8686,
      orderId: '87876',
      agentTime: '13:12:03 10.01.2010',
      amount: '166.70',
      phone: '+79090000001',
      token,
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(
      `8686#87876#13:12:03 10.01.2010#166.70#+79090000001#${token}#${secretMd5}`,
    );
    expect(result).toBe(expected);
  });
});

describe('signNotification', () => {
  it('should generate correct notification signature', () => {
    const secret = 'mysecret';
    const result = signNotification({
      agentId: 8686,
      orderId: '87876',
      paymentId: 12345678,
      amount: 166.7,
      phone: '+79090000001',
      paymentStatus: 1,
      paymentDate: '14:30:00 10.01.2010',
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(
      `8686#87876#12345678#166.7#+79090000001#1#14:30:00 10.01.2010#${secretMd5}`,
    );
    expect(result).toBe(expected);
  });
});

describe('verifyNotificationSign', () => {
  it('should return true for valid signature', () => {
    const secret = 'mysecret';
    const sign = signNotification({
      agentId: 8686,
      orderId: '87876',
      paymentId: 12345678,
      amount: 166.7,
      phone: '+79090000001',
      paymentStatus: 1,
      paymentDate: '14:30:00 10.01.2010',
      secret,
    });

    expect(
      verifyNotificationSign(
        {
          agentId: 8686,
          orderId: '87876',
          paymentId: 12345678,
          amount: 166.7,
          phone: '+79090000001',
          paymentStatus: 1,
          paymentDate: '14:30:00 10.01.2010',
          sign,
        },
        secret,
      ),
    ).toBe(true);
  });

  it('should return false for invalid signature', () => {
    expect(
      verifyNotificationSign(
        {
          agentId: 8686,
          orderId: '87876',
          paymentId: 12345678,
          amount: 166.7,
          phone: '+79090000001',
          paymentStatus: 1,
          paymentDate: '14:30:00 10.01.2010',
          sign: 'invalidsignature',
        },
        'mysecret',
      ),
    ).toBe(false);
  });
});

describe('signGetProviders', () => {
  it('should generate correct providers signature', () => {
    const secret = 'mysecret';
    const result = signGetProviders({
      agentId: 9999,
      agentTime: '20:35:67 01.01.2019',
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(`9999#20:35:67 01.01.2019#${secretMd5}`);
    expect(result).toBe(expected);
  });
});

describe('signTokenV1Create', () => {
  it('should generate correct token V1 create signature', () => {
    const secret = 'mysecret';
    const result = signTokenV1Create({
      agentId: 8686,
      orderId: '87876',
      agentTime: '13:12:03 10.01.2010',
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(`8686#87876#13:12:03 10.01.2010#${secretMd5}`);
    expect(result).toBe(expected);
  });
});

describe('signTokenV1Pay', () => {
  it('should generate correct token V1 payment signature', () => {
    const secret = 'mysecret';
    const token = 'recurringtoken123';
    const result = signTokenV1Pay({
      agentId: 8686,
      orderId: '87876',
      agentTime: '13:12:03 10.01.2010',
      amount: '166.70',
      phone: '+79090000001',
      token,
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(
      `8686#87876#13:12:03 10.01.2010#166.70#+79090000001#${token}#${secretMd5}`,
    );
    expect(result).toBe(expected);
  });
});

describe('signTokenV2', () => {
  it('should generate correct token V2 signature', () => {
    const secret = 'mysecret';
    const result = signTokenV2({
      agentId: 8686,
      preference: 125,
      secret,
    });

    const secretMd5 = md5(secret);
    const expected = md5(`8686#125#${secretMd5}`);
    expect(result).toBe(expected);
  });
});
