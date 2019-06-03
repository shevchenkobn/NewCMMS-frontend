import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { TriggerDevicesService } from '../services/trigger-devices.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriggerDevicesResolver implements Resolve<ITriggerDevice[]> {
  static readonly propName = 'triggerDevices';
  protected _triggerDevices: TriggerDevicesService;
  protected _router: Router;

  constructor(triggerDevices: TriggerDevicesService, router: Router) {
    this._triggerDevices = triggerDevices;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<ITriggerDevice[]> | Promise<ITriggerDevice[]> | ITriggerDevice[] {
    return this._triggerDevices.getTriggerDevices();
  }
}
