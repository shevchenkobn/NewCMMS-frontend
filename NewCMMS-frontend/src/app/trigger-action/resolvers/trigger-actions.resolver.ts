import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ITriggerAction } from '../../shared/models/trigger-action.model';
import { TriggerActionsService } from '../services/trigger-actions.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriggerActionsResolver implements Resolve<ITriggerAction[]> {
  static readonly propName = 'triggerActions';
  protected _triggerActions: TriggerActionsService;
  protected _router: Router;

  constructor(triggerActions: TriggerActionsService, router: Router) {
    this._triggerActions = triggerActions;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<ITriggerAction[]> | Promise<ITriggerAction[]> | ITriggerAction[] {
    return this._triggerActions.getTriggerActions();
  }
}
