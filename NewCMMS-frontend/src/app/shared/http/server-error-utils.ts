import { HttpErrorResponse } from '@angular/common/http';
import { Nullable } from '../../@types';

export enum ServerErrorCode {
  JSON_BAD = 'JSON_BAD',

  SELECT_BAD = 'SELECT_BAD',
  SORT_NO = 'SORT_NO',
  SORT_BAD = 'SORT_BAD',
  LIST_CURSOR_BAD = 'LIST_CURSOR_BAD',

  OPENAPI_VALIDATION = 'OPENAPI_VALIDATION',

  SERVER = 'SERVER',
  SERVER_OPENAPI_RESPONSE_VALIDATION = 'SERVER_OPENAPI_RESPONSE_VALIDATION',
  NOT_FOUND = 'NOT_FOUND',

  AUTH_NO = 'AUTH_NO',
  AUTH_ROLE = 'AUTH_ROLE',
  AUTH_BAD = 'AUTH_BAD',
  AUTH_BAD_SCHEME = 'AUTH_BAD_SCHEME',
  AUTH_BAD_REFRESH = 'AUTH_BAD_REFRESH',
  AUTH_EXPIRED = 'AUTH_EXPIRED',

  USER_ROLE_BAD = 'USER_ROLE_BAD',
  USER_FILTER_BAD = 'USER_FILTER_BAD',
  USER_CREDENTIALS_BAD = 'USER_CREDENTIALS_BAD',
  USER_EMAIL_DUPLICATE = 'USER_EMAIL_DUPLICATE',
  USER_EMAIL_AND_ID = 'USER_EMAIL_AND_ID',
  USER_PASSWORD_NO = 'USER_PASSWORD_NO',
  USER_PASSWORD_SAVE_NO = 'USER_PASSWORD_SAVE_NO',
  USER_PASSWORD_PROVIDED = 'USER_PASSWORD_PROVIDED',

  MAC_INVALID = 'MAC_INVALID',

  TRIGGER_DEVICE_NAME_DUPLICATE = 'TRIGGER_DEVICE_NAME_DUPLICATE',
  TRIGGER_DEVICE_MAC_DUPLICATE = 'TRIGGER_DEVICE_MAC_DUPLICATE',
  TRIGGER_DEVICE_UNIQUE_IDENTIFIER_BAD = 'TRIGGER_DEVICE_ID_AND_NAME',

  ACTION_DEVICE_NAME_DUPLICATE = 'ACTION_DEVICE_NAME_DUPLICATE',
  ACTION_DEVICE_MAC_DUPLICATE = 'ACTION_DEVICE_MAC_DUPLICATE',

  TRIGGER_ACTION_TRIGGER_DEVICE_ID_BAD = 'TRIGGER_ACTION_TRIGGER_DEVICE_ID_BAD',
  TRIGGER_ACTION_ACTION_DEVICE_ID_BAD = 'TRIGGER_ACTION_ACTION_DEVICE_ID_BAD',

  BILL_TRIGGER_DEVICE_ID_BAD = 'BILL_TRIGGER_DEVICE_ID_BAD',

  BILL_RATE_ACTION_DEVICE_ID_BAD = 'BILL_RATE_ACTION_DEVICE_ID_BAD',

  USER_TRIGGER_HISTORY_USER_ID_BAD = 'USER_TRIGGER_HISTORY_USER_ID_BAD',
  USER_TRIGGER_HISTORY_TRIGGER_DEVICE_ID_BAD = 'USER_TRIGGER_HISTORY_TRIGGER_DEVICE_ID_BAD',
}

export function isClientHttpError(err: any): err is HttpErrorResponse {
  return err instanceof HttpErrorResponse && err.error && (err.status - (err.status % 100)) === 400;
}

export function getCommonErrorMessage(err: HttpErrorResponse) {
  if (err.status === 403) {
    if (err.error && err.error.code === ServerErrorCode.AUTH_ROLE) {
      return 'errors.role';
    }
  } else if (err.status === 0) {
    return 'errors.network';
  }
  return '';
}

export function getUserUpdateOrCreateErrorMessage(err: any) {
  if (err instanceof HttpErrorResponse) {
    switch (err.error.code as string) {
      case ServerErrorCode.USER_EMAIL_DUPLICATE:
        return 'user.errors.email-dup';
      case ServerErrorCode.NOT_FOUND:
        return 'user.errors.not-found';
    }
    const msg = getCommonErrorMessage(err);
    if (msg) {
      return msg;
    }
  }
  return 'errors.unknown';
}
