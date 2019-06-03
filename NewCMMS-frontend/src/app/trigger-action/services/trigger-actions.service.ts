import { Injectable } from '@angular/core';
import { ITriggerAction, ITriggerActionChange } from '../../shared/models/trigger-action.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { assertNumericId } from '../../shared/validators/id';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriggerActionsService {
  public static readonly TRIGGER_ACTIONS_BASE = 'trigger-actions/';
  public static readonly PARAMS: Readonly<Record<string, string | string[]>> = {
    'select': (
      ['triggerActionId', 'triggerDeviceId', 'actionDeviceId'] as ReadonlyArray<keyof ITriggerAction>
    ).join(','),
  };

  protected _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }

  getTriggerActions() {
    return this._http.get<{ triggerActions: ITriggerAction[] }>(TriggerActionsService.TRIGGER_ACTIONS_BASE).pipe(
      map(actions => actions.triggerActions),
    );
  }

  getTriggerAction(triggerActionId: number) {
    try {
      assertNumericId(triggerActionId, 'triggerActionId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.get<ITriggerAction>(TriggerActionsService.TRIGGER_ACTIONS_BASE + triggerActionId.toString(), {
      params: {
        ...TriggerActionsService.PARAMS,
      }
    });
  }

  createTriggerAction(triggerAction: ITriggerActionChange): Observable<null> {
    return this._http.post<null>(TriggerActionsService.TRIGGER_ACTIONS_BASE, triggerAction);
  }

  updateTriggerAction(triggerActionId: number, triggerAction: Partial<ITriggerActionChange>): Observable<null> {
    try {
      assertNumericId(triggerActionId, 'triggerActionId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.patch<null>(TriggerActionsService.TRIGGER_ACTIONS_BASE + triggerActionId.toString(), triggerAction);
  }

  deleteTriggerAction(triggerActionId: number): Observable<null> {
    try {
      assertNumericId(triggerActionId, 'triggerActionId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.delete<null>(TriggerActionsService.TRIGGER_ACTIONS_BASE + triggerActionId.toString());
  }
}
