export class PayinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayinError';
  }
}

export class PayinApiError extends PayinError {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = 'PayinApiError';
  }
}

export class PayinNetworkError extends PayinError {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'PayinNetworkError';
  }
}

export class PayinSignatureError extends PayinError {
  constructor(message: string = 'Signature verification failed') {
    super(message);
    this.name = 'PayinSignatureError';
  }
}
