import { IUser, userRoleFromObject, UserRoles } from '../../shared/models/user.model';
import { FormGroup, ValidatorFn } from '@angular/forms';

export function userChangedValidator(user: IUser, userRoles: Record<keyof UserRoles, boolean>): ValidatorFn {
  return control => {
    const controls = (control as FormGroup).controls;
    return (
      user.email !== controls.email.value
      || user.fullName !== controls.fullName.value
      || user.role !== userRoleFromObject(userRoles)
      || !!controls.password.value
    ) ? null : { userPristine: true };
  };
}
