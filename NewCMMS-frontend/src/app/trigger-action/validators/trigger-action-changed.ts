import { ITriggerAction } from '../../shared/models/trigger-action.model';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { IActionDevice } from '../../shared/models/action-device.model';

export function triggerActionChanged(
  triggerAction: ITriggerAction,
  triggerDevice: ITriggerDevice,
  actionDevice: IActionDevice,
): ValidatorFn {
  return control => {
    const controls = (control as FormGroup).controls;
    // console.log(controls.triggerDevice.value, controls.actionDevice.value);
    // console.log(typeof controls.triggerDevice.value === 'string'
    //   ? triggerDevice.name !== controls.triggerDevice.value
    //   : userTrigger.triggerDeviceId !== controls.triggerDevice.value.triggerDeviceId, typeof controls.actionDevice.value === 'string'
    //   ? actionDevice.name !== controls.actionDevice.value
    //   : userTrigger.actionDeviceId !== controls.actionDevice.value.actionDeviceId);
    return (
      typeof controls.triggerDevice.value === 'string'
        ? triggerDevice.name !== controls.triggerDevice.value
        : triggerAction.triggerDeviceId !== controls.triggerDevice.value.triggerDeviceId
      || typeof controls.actionDevice.value === 'string'
        ? actionDevice.name !== controls.actionDevice.value
        : triggerAction.actionDeviceId !== controls.actionDevice.value.actionDeviceId
    ) ? null : { triggerActionPristine: true };
  };
}
