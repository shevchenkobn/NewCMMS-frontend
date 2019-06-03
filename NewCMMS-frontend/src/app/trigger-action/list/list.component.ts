import { Component, OnDestroy, OnInit } from '@angular/core';
import { Language } from 'angular-l10n';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TriggerDevicesService } from '../../trigger-device/services/trigger-devices.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TriggerActionsService } from '../services/trigger-actions.service';
import { ITriggerAction } from '../../shared/models/trigger-action.model';
import { IActionDevice } from '../../shared/models/action-device.model';
import { TitleService } from '../../title.service';
import { ActionDevicesService } from '../../action-device/services/action-devices.service';
import { triggerActionsBaseRoute } from '../../app-routing.module';
import { TriggerDevicesResolver } from '../../trigger-device/resolvers/trigger-devices.resolver';
import { TriggerActionsResolver } from '../resolvers/trigger-actions.resolver';
import { ActionDevicesResolver } from '../../action-device/resolvers/action-devices.resolver';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Nullable } from '../../@types';
import iterate from 'iterare';
import { ChangeComponent } from '../change/change.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  static readonly route = '';
  @Language() lang: string;
  isMakingRequest: boolean;
  triggerActions!: ITriggerAction[];
  triggerDevices!: Map<number, ITriggerDevice>;
  actionDevices!: Map<number, IActionDevice>;
  columnsToDisplay: ReadonlyArray<string>;
  routerLinks = {
    create: 'create',
    getEditRoute: ChangeComponent.getUpdateRoute,
  };
  protected _langChanged$!: Subscription;
  protected _triggerActions: TriggerActionsService;
  protected _triggerDevices: TriggerDevicesService;
  protected _actionDevices: ActionDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    triggerActions: TriggerActionsService,
    actionDevices: ActionDevicesService,
    triggerDevices: TriggerDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._triggerActions = triggerActions;
    this._actionDevices = actionDevices;
    this._triggerDevices = triggerDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.trigger-actions.list');
    this.isMakingRequest = false;
    this.columnsToDisplay = ['triggerDeviceName', 'actionDeviceName', 'edit', 'delete'];
  }

  static getAbsoluteRoute() {
    return [triggerActionsBaseRoute];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.triggerActions = this._route.snapshot.data[TriggerActionsResolver.propName];
    this.saveTriggerDevices(this._route.snapshot.data[TriggerDevicesResolver.propName]);
    this.saveActionDevices(this._route.snapshot.data[ActionDevicesResolver.propName]);
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

  refresh() {
    this.doRefreshAndUpdateComponent(() => {
      this.isMakingRequest = false;
    });
    this.isMakingRequest = true;
  }

  deleteTriggerAction(triggerActionId: number) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'trigger-device.delete.question'
      },
      autoFocus: false
    }).afterClosed().subscribe(yes => {
      if (!yes) {
        return;
      }
      this.isMakingRequest = true;
      this._triggerActions.deleteTriggerAction(triggerActionId).subscribe(
        () => {
          this.doRefreshAndUpdateComponent(() => {
            this.isMakingRequest = false;
            const translations = this._l10n.translate.translate(['trigger-action.delete.done', 'dialog.ok']);
            this._snackBar.dismiss();
            this._snackBar.open(translations['trigger-action.delete.done'], translations['dialog.ok']);
          });
        },
        (err: any) => {
          let msg: Nullable<string> = null;
          if (err instanceof HttpErrorResponse) {
            if (isClientHttpError(err)) {
              const code = err.error.code as ServerErrorCode;
              if (code === ServerErrorCode.NOT_FOUND) {
                msg = 'trigger-action.errors.not-found';
              }
            }
            if (!msg) {
              msg = getCommonErrorMessage(err);
            }
          }
          if (!msg) {
            msg = 'errors.unknown';
          }
          this._snackBar.dismiss();
          const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
          this._snackBar.open(translations[msg], translations['dialog.ok']);
        },
      );
    });
  }

  protected doRefreshAndUpdateComponent(onFinalize: () => void) {
    return forkJoin(
      this._triggerActions.getTriggerActions(),
      this._triggerDevices.getTriggerDevices(),
      this._actionDevices.getActionDevices(),
    ).pipe(
      finalize(onFinalize),
    ).subscribe(
      ([triggerActions, triggerDevices, actionDevices]) => {
        this.triggerActions = triggerActions;
        this.saveTriggerDevices(triggerDevices);
        this.saveActionDevices(actionDevices);
      },
      (err: any) => {
        console.error('Trigger actions refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      }
    );
  }

  protected saveTriggerDevices(triggerDevices: ITriggerDevice[]) {
    this.triggerDevices = new Map(
      iterate(triggerDevices).map(d => [d.triggerDeviceId, d]) as any,
    );
  }

  protected saveActionDevices(actionDevices: IActionDevice[]) {
    this.actionDevices = new Map(
      iterate(actionDevices).map(d => [d.actionDeviceId, d]) as any,
    );
  }
}
