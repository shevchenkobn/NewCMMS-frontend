export enum ErrorCode {
  ID_NUMERIC_NOT
}

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, msg?: string) {
    super(msg);
    this.code = code;
  }
}
