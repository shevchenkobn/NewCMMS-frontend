import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { TriggerDevicesService } from '../services/trigger-devices.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isClientHttpError } from '../../shared/http/server-error-utils';
import { AppError } from '../../shared/services/error.service';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { getFullPath } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class TriggerDeviceResolver implements Resolve<ITriggerDevice> {
  static readonly propName = 'triggerDevice';
  static readonly paramName = 'triggerDeviceId';
  protected _triggerDevices: TriggerDevicesService;
  protected _router: Router;

  constructor(triggerDevices: TriggerDevicesService, router: Router) {
    this._triggerDevices = triggerDevices;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<ITriggerDevice> | Promise<ITriggerDevice> | ITriggerDevice {
    return this._triggerDevices.getTriggerDevice(Number.parseInt(route.params[TriggerDeviceResolver.paramName], 10)).pipe(
      catchError((err: any) => {
        if (isClientHttpError(err) && (err.status === 404 || err.status === 400)) {
          this.navigateToNotFound(route);
          return of(null as any);
        }
        if (err instanceof AppError) {
          console.error('AppError in user resolver', err);
          this.navigateToNotFound(route);
        }
        return throwError(err);
      }),
    );
  }

  protected navigateToNotFound(route: ActivatedRouteSnapshot) {
    this._router.navigate([PageNotFoundComponent.dedicatedRoute], {
      queryParams: {
        url: getFullPath(route.pathFromRoot, false)
      }
    }).catch(navError => {
      console.error('From user by id resolve navigate', navError);
    });
  }
}
