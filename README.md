# @betcube/payin-payout-sdk

NestJS SDK for Payin-Payout payment system (Payin API).

All communication is JSON-based. The SDK handles form-data encoding for outgoing requests and XML acknowledgment for webhooks internally.

## Installation

```bash
npm install @betcube/payin-payout-sdk
```

**Peer dependencies** (come with any NestJS project):

- `@nestjs/common` ^10.0.0
- `@nestjs/core` ^10.0.0
- `reflect-metadata`
- `rxjs` ^7.0.0

**Node.js >= 18** required (uses built-in `fetch`).

## Quick Start

### 1. Register the module

**Static configuration:**

```typescript
import { Module } from '@nestjs/common'
import { PayinModule } from '@betcube/payin-payout-sdk'

@Module({
	imports: [
		PayinModule.forRoot({
			agentId: 8686,
			secret: 'your-secret-key',
			sandbox: true, // use dev1.payin-payout.net
		}),
	],
})
export class AppModule {}
```

**Async configuration (recommended for production):**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PayinModule } from '@betcube/payin-payout-sdk'

@Module({
	imports: [
		ConfigModule.forRoot(),
		PayinModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				agentId: Number(config.get('PAYIN_AGENT_ID')),
				secret: config.get('PAYIN_SECRET'),
				sandbox: config.get('NODE_ENV') !== 'production',
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}
```

### 2. Inject the service

```typescript
import { Injectable } from '@nestjs/common'
import { PayinService } from '@betcube/payin-payout-sdk'

@Injectable()
export class PaymentService {
	constructor(private readonly payin: PayinService) {}

	async pay() {
		const result = await this.payin.createPayment({
			orderId: '12345',
			agentName: 'My Store',
			amount: 1500.0,
			goods: 'Premium subscription',
			email: 'customer@example.com',
			phone: '+79161234567',
			agentTime: '14:30:00 07.02.2026',
			successUrl: 'https://mystore.com/success',
			failUrl: 'https://mystore.com/fail',
		})

		// Redirect user's browser to result.redirectUrl
		return result
	}
}
```

## Configuration

| Option    | Type      | Required | Default | Description                                    |
| --------- | --------- | -------- | ------- | ---------------------------------------------- |
| `agentId` | `number`  | yes      | —       | Merchant ID (1–999999)                         |
| `secret`  | `string`  | yes      | —       | Secret key from admin panel                    |
| `sandbox` | `boolean` | no       | `false` | Use test environment (`dev1.payin-payout.net`) |
| `baseUrl` | `string`  | no       | —       | Custom base URL (overrides `sandbox`)          |
| `timeout` | `number`  | no       | `30000` | Request timeout in ms                          |

## API Methods

All methods are available through `PayinService`. The SDK automatically computes MD5 signatures and encodes requests as form-data.

### createPayment

Register a payment. Returns a redirect URL for the payment form.

```typescript
const result = await this.payin.createPayment({
	orderId: '12345',
	agentName: 'My Store',
	amount: 1500.0,
	goods: 'Notebook',
	email: 'user@example.com',
	phone: '+79161234567',
	agentTime: '14:30:00 07.02.2026',
	currency: 'RUR', // optional, default RUR
	preference: 125, // optional, payment method
	successUrl: 'https://...', // optional
	failUrl: 'https://...', // optional
	shopUrl: 'https://...', // optional
	limitTime: '14:30:00 08.02.2026', // optional, expiry
	addInfo: { 1: 'info1', 2: 'info2' }, // optional
	purchase: {
		// optional, product list
		products: [
			{
				name: 'Notebook',
				price: 500,
				quantity: 3,
				vat: 0.18,
				unit: 'piece',
				discount: { type: 'percent', value: 10 },
			},
		],
	},
})

// result.redirectUrl — redirect user here
```

### getPaymentMethods

Get available payment methods for the store.

```typescript
const methods = await this.payin.getPaymentMethods({
	agentTime: '14:30:00 07.02.2026',
})

// methods: PaymentMethod[]
// [{ id, slug, title, preference, icon, enabled, ... }]
```

### createTokenV1

Create a recurring payment token from a successful payment (without 3DS).

```typescript
const result = await this.payin.createTokenV1({
	orderId: '12345', // order that was already paid
	agentTime: '14:30:00 07.02.2026',
})

// result.status — true/false
// result.result — token string or error message
```

### payWithTokenV1

Execute a recurring payment using a V1 token.

```typescript
const result = await this.payin.payWithTokenV1({
	orderId: '12346', // new order ID
	agentName: 'My Store',
	amount: 500.0,
	goods: 'Monthly subscription',
	email: 'user@example.com',
	phone: '+79161234567',
	preference: 125,
	agentTime: '14:30:00 07.02.2026',
	token: 'token-from-createTokenV1',
})

// result.status — true/false
// result.result — success/error message
// result.url — 3DS redirect URL (if needed)
```

### createTokenV2

Create a token with 3DS support. Returns a URL where the user must confirm the token.

```typescript
const result = await this.payin.createTokenV2({
	preference: 125,
	successUrl: 'https://mystore.com/token-confirmed',
	cancelUrl: 'https://mystore.com/token-cancelled',
	callbackUrl: 'https://mystore.com/token-callback', // optional
	currency: 'RUR', // optional
	amount: 1.0, // optional, verification charge
	email: 'user@example.com', // optional
})

// result.result.token — token string
// result.result.client_redirect_url — redirect user here to confirm
```

### getTokenV2Status

Check whether a V2 token has been confirmed.

```typescript
const result = await this.payin.getTokenV2Status({
	preference: 125,
	token: 'token-from-createTokenV2',
})

// result.result.status — 'SUCCEEDED' or 'not confirmed'
```

### createTerminalInvoice

Create an invoice for terminal payment (user enters invoice number at a terminal).

```typescript
const result = await this.payin.createTerminalInvoice({
	orderId: '12345',
	agentName: 'My Store',
	amount: 200.0,
	goods: 'Service payment',
	email: 'user@example.com',
	phone: '+79161234567',
	agentTime: '14:30:00 07.02.2026',
})

// result.result.number — invoice number (e.g. "007978-000367")
// result.result.payment_id — payment ID
```

### createP2PInvoice

Create a P2P transfer invoice (card-to-card or SBP).

```typescript
// Card-to-card (ANY)
const result = await this.payin.createP2PInvoice({
	orderId: '12345',
	agentName: 'My Store',
	amount: 600.0,
	goods: 'Transfer',
	email: 'user@example.com',
	phone: '+79161234567',
	agentTime: '14:30:00 07.02.2026',
	clientId: 'client-123', // required for P2P
	p2pType: 'ANY',
})

// For 'ANY': result.cardNumber — destination card
// For 'SBP': result.receiverPhone, result.receiverBank, result.receiverName
```

**P2P types:**

- `ANY` — card-to-card transfer (response includes `cardNumber`)
- `SBP` — SBP fast payment (response includes `receiverPhone`, `receiverBank`, `receiverName`)
- `SBP_TG` — cross-border SBP transfer

## Webhook Handling

The SDK provides three components for processing payment notifications:

| Component                 | Role                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `PayinWebhookGuard`       | Verifies MD5 signature, rejects invalid requests (403)                   |
| `@PayinWebhook()`         | Param decorator — parses form-data body into typed `PaymentNotification` |
| `PayinWebhookInterceptor` | Converts `{ acknowledged: true }` into XML response automatically        |

### Setup

```typescript
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import {
	PayinWebhookGuard,
	PayinWebhookInterceptor,
	PayinWebhook,
	PaymentNotification,
	PaymentStatus,
} from '@betcube/payin-payout-sdk'

@Controller('webhooks')
export class WebhooksController {
	@Post('payin')
	@UseGuards(PayinWebhookGuard)
	@UseInterceptors(PayinWebhookInterceptor)
	handlePayment(@PayinWebhook() notification: PaymentNotification) {
		console.log('Order:', notification.orderId)
		console.log('Amount:', notification.amount)
		console.log('Status:', notification.paymentStatus)

		if (notification.paymentStatus === PaymentStatus.SUCCESS) {
			// Mark order as paid
		}

		// Return { acknowledged: true } to send XML ack to Payin-Payout.
		// The interceptor generates the XML automatically:
		// <?xml version="1.0" encoding="UTF-8"?><response><result>0</result></response>
		return { acknowledged: true }
	}
}
```

**Important:** Your NestJS app must parse `application/x-www-form-urlencoded` bodies. With Express (default), add to `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core'
import { urlencoded } from 'express'

const app = await NestFactory.create(AppModule)
app.use(urlencoded({ extended: false }))
```

### PaymentNotification fields

| Field           | Type                      | Description                                      |
| --------------- | ------------------------- | ------------------------------------------------ |
| `agentId`       | `number`                  | Merchant ID                                      |
| `orderId`       | `string`                  | Order number                                     |
| `paymentId`     | `number`                  | Transaction ID                                   |
| `amount`        | `number`                  | Payment amount (cumulative for partial payments) |
| `currency`      | `string?`                 | Currency code                                    |
| `phone`         | `string`                  | Customer phone                                   |
| `preference`    | `number`                  | Payment method code                              |
| `paymentStatus` | `1 \| 2 \| 3`             | 1 = success, 2 = error, 3 = partial              |
| `paymentDate`   | `string`                  | Format: `HH:mm:SS dd.MM.YYYY`                    |
| `goods`         | `string`                  | Product description                              |
| `agentName`     | `string`                  | Merchant name                                    |
| `sign`          | `string`                  | MD5 signature (already verified by guard)        |
| `comment`       | `string?`                 | Payment comment                                  |
| `addInfo`       | `Record<number, string>?` | Custom fields                                    |

## Constants

```typescript
import {
	PaymentStatus,
	PaymentPreference,
	Currency,
	P2PType,
} from '@betcube/payin-payout-sdk'

PaymentStatus.SUCCESS // 1
PaymentStatus.ERROR // 2
PaymentStatus.PARTIAL // 3

PaymentPreference.PLASTIC_CARDS // 22
PaymentPreference.PLASTIC_CARDS_ALT // 125
PaymentPreference.SBP // 136
PaymentPreference.RECURRING // 133

Currency.RUR // 'RUR'
Currency.USD // 'USD'
Currency.EUR // 'EUR'

P2PType.ANY // 'ANY'
P2PType.SBP // 'SBP'
P2PType.SBP_TG // 'SBP_TG'
```

## Error Handling

```typescript
import {
  PayinError,        // base class
  PayinApiError,     // API returned error (non-2xx or status:false)
  PayinNetworkError, // network/timeout
  PayinSignatureError, // signature mismatch
} from '@betcube/payin-payout-sdk';

try {
  await this.payin.createP2PInvoice({ ... });
} catch (error) {
  if (error instanceof PayinApiError) {
    console.log(error.message);      // error text
    console.log(error.httpStatus);    // HTTP status
    console.log(error.responseBody);  // raw response
  }
}
```

## Environments

| Environment | URL                             |
| ----------- | ------------------------------- |
| Production  | `https://lk.payin-payout.net`   |
| Sandbox     | `https://dev1.payin-payout.net` |

Sandbox does not charge real money and provides simulated success/error pages.

## Timestamp Format

All `agentTime` and `limitTime` fields use the format `HH:mm:SS dd.MM.yyyy` (24-hour, zero-padded).

Example: `14:30:00 07.02.2026`

## License

Private. For internal use only.
