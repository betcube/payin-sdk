import type { Purchase } from '../interfaces/payment.interface';

export function flattenPurchase(purchase: Purchase): Record<string, string> {
  const result: Record<string, string> = {};
  purchase.products.forEach((product, index) => {
    const prefix = `purchase[products][${index}]`;
    result[`${prefix}[name]`] = product.name;
    result[`${prefix}[price]`] = String(product.price);
    result[`${prefix}[quantity]`] = String(product.quantity);
    result[`${prefix}[vat]`] = String(product.vat);
    result[`${prefix}[unit]`] = product.unit;
    if (product.discount) {
      result[`${prefix}[discount][type]`] = product.discount.type;
      result[`${prefix}[discount][value]`] = String(product.discount.value);
    }
  });
  return result;
}

export function flattenAddInfo(
  addInfo: Record<number, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(addInfo)) {
    result[`addInfo_${key}`] = value;
  }
  return result;
}

export function parseAddInfo(
  data: Record<string, string>,
): Record<number, string> | undefined {
  const addInfo: Record<number, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const match = key.match(/^addInfo_(\d+)$/);
    if (match) {
      addInfo[parseInt(match[1], 10)] = value;
    }
  }
  return Object.keys(addInfo).length > 0 ? addInfo : undefined;
}
