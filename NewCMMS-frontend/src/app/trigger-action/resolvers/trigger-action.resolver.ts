import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ITriggerAction } from '../../shared/models/trigger-action.model';
import { TriggerActionsService } from '../services/trigger-actions.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isClientHttpError } from '../../shared/http/server-error-utils';
import { AppError } from '../../shared/services/error.service';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { getFullPath } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class TriggerActionResolver implements Resolve<ITriggerAction> {
  static readonly propName = 'triggerAction';
  static readonly paramName = 'triggerActionId';
  protected _triggerActions: TriggerActionsService;
  protected _router: Router;

  constructor(triggerActions: TriggerActionsService, router: Router) {
    this._triggerActions = triggerActions;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<ITriggerAction> | Promise<ITriggerAction> | ITriggerAction {
    return this._triggerActions.getTriggerAction(Number.parseInt(route.params[TriggerActionResolver.paramName], 10)).pipe(
      catchError((err: any) => {
        if (isClientHttpError(err) && (err.status === 404 || err.status === 400)) {
          this.navigateToNotFound(route);
          return of(null as any);
        }
        if (err instanceof AppError) {
          console.error('AppError in trigger action resolver', err);
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
      console.error('From trigger actoin by id resolve navigate', navError);
    });
  }
}
