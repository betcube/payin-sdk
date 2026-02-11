import { createHash } from 'node:crypto';

export function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

function buildSignature(
  parts: (string | number)[],
  secretMd5: string,
): string {
  return md5([...parts.map(String), secretMd5].join('#'));
}

/** Payment registration: MD5(agentId#orderId#agentTime#amount#phone#[token#]MD5(secret)) */
export function signPayment(params: {
  agentId: number;
  orderId: string;
  agentTime: string;
  amount: string;
  phone: string;
  token?: string;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  const parts: (string | number)[] = [
    params.agentId,
    params.orderId,
    params.agentTime,
    params.amount,
    params.phone,
  ];
  if (params.token) parts.push(params.token);
  return buildSignature(parts, secretMd5);
}

/** Notification verification: MD5(agentId#orderId#paymentId#amount#phone#paymentStatus#paymentDate#MD5(secret)) */
export function signNotification(params: {
  agentId: number;
  orderId: string;
  paymentId: number;
  amount: number;
  phone: string;
  paymentStatus: number;
  paymentDate: string;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  return buildSignature(
    [
      params.agentId,
      params.orderId,
      params.paymentId,
      params.amount,
      params.phone,
      params.paymentStatus,
      params.paymentDate,
    ],
    secretMd5,
  );
}

/** Verify a notification's signature */
export function verifyNotificationSign(
  notification: {
    agentId: number;
    orderId: string;
    paymentId: number;
    amount: number;
    phone: string;
    paymentStatus: number;
    paymentDate: string;
    sign: string;
  },
  secret: string,
): boolean {
  const expected = signNotification({ ...notification, secret });
  return expected === notification.sign;
}

/** Get providers: MD5(agentId#agentTime#MD5(secret)) */
export function signGetProviders(params: {
  agentId: number;
  agentTime: string;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  return buildSignature([params.agentId, params.agentTime], secretMd5);
}

/** Token V1 create: MD5(agentId#orderId#agentTime#MD5(secret)) */
export function signTokenV1Create(params: {
  agentId: number;
  orderId: string;
  agentTime: string;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  return buildSignature(
    [params.agentId, params.orderId, params.agentTime],
    secretMd5,
  );
}

/** Token V1 pay: MD5(agentId#orderId#agentTime#amount#phone#token#MD5(secret)) */
export function signTokenV1Pay(params: {
  agentId: number;
  orderId: string;
  agentTime: string;
  amount: string;
  phone: string;
  token: string;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  return buildSignature(
    [
      params.agentId,
      params.orderId,
      params.agentTime,
      params.amount,
      params.phone,
      params.token,
    ],
    secretMd5,
  );
}

/** Token V2 create/status: MD5(agentId#preference#MD5(secret)) */
export function signTokenV2(params: {
  agentId: number;
  preference: number;
  secret: string;
}): string {
  const secretMd5 = md5(params.secret);
  return buildSignature([params.agentId, params.preference], secretMd5);
}
