import { Injectable, Inject } from '@nestjs/common';
import type { PayinModuleOptions } from '../interfaces/payin-module-options.interface';
import { PAYIN_MODULE_OPTIONS, PRODUCTION_URL, SANDBOX_URL } from '../payin.constants';
import { PayinApiError, PayinNetworkError } from '../errors/payin.errors';

export interface HttpResponse<T> {
  status: number;
  data: T;
  redirectUrl?: string;
}

@Injectable()
export class PayinHttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    @Inject(PAYIN_MODULE_OPTIONS) private options: PayinModuleOptions,
  ) {
    if (options.baseUrl) {
      this.baseUrl = options.baseUrl.replace(/\/$/, '');
    } else {
      this.baseUrl = options.sandbox ? SANDBOX_URL : PRODUCTION_URL;
    }
    this.timeout = options.timeout ?? 30_000;
  }

  async postForm<T>(
    path: string,
    formData: Record<string, string>,
    options?: { expectRedirect?: boolean },
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const body = new URLSearchParams(formData).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        redirect: options?.expectRedirect ? 'manual' : 'follow',
        signal: controller.signal,
      });

      if (
        options?.expectRedirect &&
        response.status >= 300 &&
        response.status < 400
      ) {
        const redirectUrl = response.headers.get('location');
        return {
          status: response.status,
          data: undefined as T,
          redirectUrl: redirectUrl ?? undefined,
        };
      }

      if (!response.ok) {
        const text = await response.text();
        throw new PayinApiError(
          `HTTP ${response.status}: ${text}`,
          response.status,
          text,
        );
      }

      const data = (await response.json()) as T;
      return { status: response.status, data };
    } catch (error) {
      if (error instanceof PayinApiError) throw error;
      throw new PayinNetworkError(
        `Network error calling ${url}: ${(error as Error).message}`,
        error as Error,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
