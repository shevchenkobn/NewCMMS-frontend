import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IActionDevice } from '../../shared/models/action-device.model';
import { ActionDevicesService } from '../services/action-devices.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isClientHttpError } from '../../shared/http/server-error-utils';
import { AppError } from '../../shared/services/error.service';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { getFullPath } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class ActionDeviceResolver implements Resolve<IActionDevice[]> {
  static readonly propName = 'actionDevice';
  static readonly paramName = 'actionDeviceId';
  protected _actionDevices: ActionDevicesService;
  protected _router: Router;

  constructor(actionDevices: ActionDevicesService, router: Router) {
    this._actionDevices = actionDevices;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IActionDevice[]> | Promise<IActionDevice[]> | IActionDevice[] {
    return this._actionDevices.getActionDevice(Number.parseInt(route.params[ActionDeviceResolver.paramName], 10)).pipe(
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
