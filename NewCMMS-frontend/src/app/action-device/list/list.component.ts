import { Component, OnDestroy, OnInit } from '@angular/core';
import { actionDevicesBaseRoute } from '../../app-routing.module';
import { Language } from 'angular-l10n';
import { ActionDeviceStatus, IActionDevice } from '../../shared/models/action-device.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { ActionDevicesService } from '../services/action-devices.service';
import { TitleService } from '../../title.service';
import { ActionDevicesResolver } from '../resolvers/action-devices.resolver';
import { finalize, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Nullable } from '../../@types';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  static readonly route = '';
  @Language() lang: string;
  isMakingRequest: boolean;
  actionDevices!: IActionDevice[];
  actionDeviceStatus = ActionDeviceStatus;
  columnsToDisplay: ReadonlyArray<string>;
  routerLinks = {
    create: 'create',
    getEditRoute(actionDeviceId: number) {
      return [actionDeviceId, 'edit'];
    },
  };
  protected _langChanged$!: Subscription;
  protected _actionDevices: ActionDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    actionDevices: ActionDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._actionDevices = actionDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.action-devices.list');
    this.columnsToDisplay = ['physicalAddress', 'status', 'name', 'type', 'hourlyRate', 'edit', 'delete'];
    this.isMakingRequest = false;
  }

  static getAbsoluteRoute() {
    return [actionDevicesBaseRoute];
  }

  getStatusChipColor(status: ActionDeviceStatus) {
    switch (status) {
      case ActionDeviceStatus.DISCONNECTED:
        return null;
      case ActionDeviceStatus.CONNECTED:
        return 'primary';
      case ActionDeviceStatus.ONLINE:
        return 'accent';
    }
  }

  refresh() {
    this._actionDevices.getActionDevices().pipe(
      finalize(() => {
        this.isMakingRequest = false;
      }),
    ).subscribe(
      actionDevices => this.actionDevices = actionDevices,
      err => {
        console.error('Action device refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      },
    );
    this.isMakingRequest = true;
  }

  deleteActionDevice(actionDeviceId: number) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'action-device.delete.question'
      },
      autoFocus: false
    }).afterClosed().subscribe(yes => {
      if (!yes) {
        return;
      }
      this.isMakingRequest = true;
      this._actionDevices.deleteActionDevice(actionDeviceId).pipe(
        switchMap(() => {
          return this._actionDevices.getActionDevices();
        }),
        finalize(() => {
          this.isMakingRequest = false;
        }),
      ).subscribe(
        (actionDevices) => {
          this.actionDevices = actionDevices;
          const translations = this._l10n.translate.translate(['action-device.delete.done', 'dialog.ok']);
          this._snackBar.dismiss();
          this._snackBar.open(translations['action-device.delete.done'], translations['dialog.ok']);
        },
        (err: any) => {
          let msg: Nullable<string> = null;
          if (err instanceof HttpErrorResponse) {
            if (isClientHttpError(err)) {
              const code = err.error.code as ServerErrorCode;
              if (code === ServerErrorCode.NOT_FOUND) {
                msg = 'action-device.errors.not-found';
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

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.actionDevices = this._route.snapshot.data[ActionDevicesResolver.propName];
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

}
