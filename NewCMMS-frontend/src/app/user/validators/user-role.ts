import { userRoleFromObject } from '../../shared/models/user.model';

export function userRoleValidator(obj: Record<string, boolean>) {
  return () => {
    return !!userRoleFromObject(obj) ? null : { userRole: true };
  };
}
