import { FormGroup, ValidatorFn } from '@angular/forms';
import { IActionDevice } from '../../shared/models/action-device.model';

export function actionDeviceChanged(actionDevice: IActionDevice): ValidatorFn {
  return control => {
    const controls = (control as FormGroup).controls;
    return (
      actionDevice.physicalAddress !== controls.physicalAddress.value
      || actionDevice.status !== controls.status.value
      || actionDevice.name !== controls.name.value
      || actionDevice.type !== controls.type.value
      || actionDevice.hourlyRate !== controls.hourlyRate.value
    ) ? null : { actionDevicePristine: true };
  };
}
