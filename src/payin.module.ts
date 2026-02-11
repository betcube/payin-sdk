import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PAYIN_MODULE_OPTIONS } from './payin.constants';
import type {
  PayinModuleOptions,
  PayinModuleAsyncOptions,
} from './interfaces/payin-module-options.interface';
import { PayinService } from './payin.service';
import { PayinHttpClient } from './core/http.client';
import { PayinWebhookService } from './webhook/webhook.service';
import { PayinWebhookGuard } from './webhook/webhook.guard';

@Module({})
export class PayinModule {
  static forRoot(options: PayinModuleOptions): DynamicModule {
    return {
      module: PayinModule,
      global: true,
      providers: [
        {
          provide: PAYIN_MODULE_OPTIONS,
          useValue: options,
        },
        PayinHttpClient,
        PayinService,
        PayinWebhookService,
        PayinWebhookGuard,
      ],
      exports: [PayinService, PayinWebhookService, PayinWebhookGuard],
    };
  }

  static forRootAsync(options: PayinModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: PAYIN_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: PayinModule,
      global: true,
      imports: options.imports || [],
      providers: [
        asyncProvider,
        PayinHttpClient,
        PayinService,
        PayinWebhookService,
        PayinWebhookGuard,
      ],
      exports: [PayinService, PayinWebhookService, PayinWebhookGuard],
    };
  }
}
