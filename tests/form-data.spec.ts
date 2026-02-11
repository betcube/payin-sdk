import { describe, it, expect } from 'vitest';
import {
  flattenPurchase,
  flattenAddInfo,
  parseAddInfo,
} from '../src/utils/form-data';

describe('flattenPurchase', () => {
  it('should flatten a purchase with one product', () => {
    const result = flattenPurchase({
      products: [
        {
          name: 'Notebook',
          price: 3.0,
          quantity: 3,
          vat: 0.18,
          unit: 'piece',
          discount: { type: 'amount', value: 2 },
        },
      ],
    });

    expect(result).toEqual({
      'purchase[products][0][name]': 'Notebook',
      'purchase[products][0][price]': '3',
      'purchase[products][0][quantity]': '3',
      'purchase[products][0][vat]': '0.18',
      'purchase[products][0][unit]': 'piece',
      'purchase[products][0][discount][type]': 'amount',
      'purchase[products][0][discount][value]': '2',
    });
  });

  it('should flatten a purchase with multiple products', () => {
    const result = flattenPurchase({
      products: [
        {
          name: 'Item A',
          price: 10,
          quantity: 1,
          vat: 0.2,
          unit: 'piece',
        },
        {
          name: 'Item B',
          price: 5.5,
          quantity: 2,
          vat: 0.1,
          unit: 'kg',
          discount: { type: 'percent', value: 10 },
        },
      ],
    });

    expect(result['purchase[products][0][name]']).toBe('Item A');
    expect(result['purchase[products][1][name]']).toBe('Item B');
    expect(result['purchase[products][1][discount][type]']).toBe('percent');
    expect(result['purchase[products][1][discount][value]']).toBe('10');
    // First product has no discount
    expect(result['purchase[products][0][discount][type]']).toBeUndefined();
  });
});

describe('flattenAddInfo', () => {
  it('should flatten addInfo record', () => {
    const result = flattenAddInfo({
      1: 'first info',
      2: 'second info',
      5: 'fifth info',
    });

    expect(result).toEqual({
      addInfo_1: 'first info',
      addInfo_2: 'second info',
      addInfo_5: 'fifth info',
    });
  });

  it('should handle empty addInfo', () => {
    expect(flattenAddInfo({})).toEqual({});
  });
});

describe('parseAddInfo', () => {
  it('should parse addInfo from flat form data', () => {
    const data = {
      agentId: '8686',
      orderId: '123',
      addInfo_1: 'first',
      addInfo_2: 'second',
      sign: 'abc',
    };

    const result = parseAddInfo(data);
    expect(result).toEqual({
      1: 'first',
      2: 'second',
    });
  });

  it('should return undefined when no addInfo present', () => {
    const data = {
      agentId: '8686',
      orderId: '123',
    };

    expect(parseAddInfo(data)).toBeUndefined();
  });
});
