import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { FormGroup, ValidatorFn } from '@angular/forms';

export function triggerDeviceChanged(triggerDevice: ITriggerDevice): ValidatorFn {
  return control => {
    const controls = (control as FormGroup).controls;
    return (
      triggerDevice.physicalAddress !== controls.physicalAddress.value
      || triggerDevice.status !== controls.status.value
      || triggerDevice.name !== controls.name.value
      || triggerDevice.type !== controls.type.value
    ) ? null : { actionDevicePristine: true };
  };
}
