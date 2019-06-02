import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { IActionDevice } from '../../shared/models/action-device.model';
import { ActionDevicesService } from '../services/action-devices.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionDevicesResolver implements Resolve<IActionDevice[]> {
  static readonly propName = 'actionDevices';
  protected _actionDevices: ActionDevicesService;

  constructor(actionDevices: ActionDevicesService) {
    this._actionDevices = actionDevices;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IActionDevice[]> | Promise<IActionDevice[]> | IActionDevice[] {
    return this._actionDevices.getActionDevices();
  }
}
