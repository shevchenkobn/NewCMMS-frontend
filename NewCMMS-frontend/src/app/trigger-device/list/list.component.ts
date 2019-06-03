import { Component, OnDestroy, OnInit } from '@angular/core';
import { Language } from 'angular-l10n';
import { ITriggerDevice, TriggerDeviceStatus } from '../../shared/models/trigger-device.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TriggerDevicesService } from '../services/trigger-devices.service';
import { TitleService } from '../../title.service';
import { triggerDevicesBaseRoute } from '../../app-routing.module';
import { finalize, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Nullable } from '../../@types';
import { TriggerDevicesResolver } from '../resolvers/trigger-devices.resolver';
import { IUser, UserRoles } from '../../shared/models/user.model';
import { ProfileResolver } from '../../shared/auth/identity.resolver';
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
  currentUser!: IUser;
  triggerDevices!: ITriggerDevice[];
  userRoles = UserRoles;
  triggerDeviceStatus = TriggerDeviceStatus;
  columnsToDisplay!: ReadonlyArray<string>;
  routerLinks = {
    create: ChangeComponent.createRoute,
    getEditRoute: ChangeComponent.getUpdateRoute,
  };
  protected _langChanged$!: Subscription;
  protected _triggerDevices: TriggerDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    triggerDevices: TriggerDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._triggerDevices = triggerDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.trigger-devices.list');
    this.isMakingRequest = false;
  }

  static getAbsoluteRoute() {
    return [triggerDevicesBaseRoute];
  }

  getStatusChipColor(status: TriggerDeviceStatus) {
    switch (status) {
      case TriggerDeviceStatus.DISCONNECTED:
        return null;
      case TriggerDeviceStatus.CONNECTED:
        return 'primary';
    }
  }

  refresh() {
    this._triggerDevices.getTriggerDevices().pipe(
      finalize(() => {
        this.isMakingRequest = false;
      }),
    ).subscribe(
      triggerDevices => this.triggerDevices = triggerDevices,
      err => {
        console.error('Trigger device refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      },
    );
    this.isMakingRequest = true;
  }

  deleteTriggerDevice(triggerDeviceId: number) {
    if (!(this.currentUser.role & UserRoles.ADMIN)) {
      return;
    }
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
      this._triggerDevices.deleteTriggerDevice(triggerDeviceId).pipe(
        switchMap(() => {
          return this._triggerDevices.getTriggerDevices();
        }),
        finalize(() => {
          this.isMakingRequest = false;
        }),
      ).subscribe(
        (triggerDevices) => {
          this.triggerDevices = triggerDevices;
          const translations = this._l10n.translate.translate(['trigger-device.delete.done', 'dialog.ok']);
          this._snackBar.dismiss();
          this._snackBar.open(translations['trigger-device.delete.done'], translations['dialog.ok']);
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
    this.currentUser = this._route.snapshot.data[ProfileResolver.propName];
    this.triggerDevices = this._route.snapshot.data[TriggerDevicesResolver.propName];
    this.columnsToDisplay = this.currentUser.role & UserRoles.ADMIN
      ? ['physicalAddress', 'status', 'name', 'type', 'edit', 'delete']
      : ['physicalAddress', 'status', 'name', 'type'];
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }
}
