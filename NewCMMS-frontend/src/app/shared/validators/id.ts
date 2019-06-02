import { AppError, ErrorCode } from '../services/error.service';
import { throwError } from 'rxjs';

export function isNumericId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id >= 1;
}

export function assertNumericId(id: unknown, message?: string): id is number {
  if (!isNumericId(id)) {
    throw new AppError(ErrorCode.ID_NUMERIC_NOT, message);
  }
  return true;
}
