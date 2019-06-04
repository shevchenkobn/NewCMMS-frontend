import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserTriggerHistoryResolver } from '../resolvers/user-trigger-history.resolver';
import { Language } from 'angular-l10n';
import { IUserTrigger, UserTriggerType } from '../../shared/models/user-trigger.model';
import { forkJoin, Subscription } from 'rxjs';
import { UsersService } from '../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { AuthService } from '../../shared/auth/auth.service';
import { TitleService } from '../../title.service';
import { IdentityTriggerHistoryResolver } from '../resolvers/identity-trigger-history.resolver';
import { TriggerDevicesResolver } from '../../trigger-device/resolvers/trigger-devices.resolver';
import { TriggerDevicesService } from '../../trigger-device/services/trigger-devices.service';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import iterate from 'iterare';
import { IUser } from '../../shared/models/user.model';
import { UserResolver } from '../resolvers/user.resolver';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Nullable } from '../../@types';
import { dateTimeFormat } from '../../shared/utils';

@Component({
  selector: 'app-user-trigger-history',
  templateUrl: './user-trigger-history.component.html',
  styleUrls: ['./user-trigger-history.component.scss']
})
export class UserTriggerHistoryComponent implements OnInit, OnDestroy {
  static readonly identityRouteLink = ['identity', 'trigger-history'];
  static readonly identityRoute = UserTriggerHistoryComponent.identityRouteLink.join('/');
  static readonly userRoutePattern = `:${UserTriggerHistoryResolver.paramName}/trigger-history`;

  @Language() lang: string;
  isMakingRequest: boolean;
  user!: IUser;
  userTriggers!: IUserTrigger[];
  triggerDevices!: Map<number, ITriggerDevice>;
  userTriggerType = UserTriggerType;
  dateTimeFormat = dateTimeFormat;
  showsIdentity!: boolean;
  columnsToDisplay!: ReadonlyArray<string>;
  protected _langChanged$!: Subscription;
  protected _auth: AuthService;
  protected _users: UsersService;
  protected _triggerDevices: TriggerDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;
  protected _title: TitleService;

  constructor(
    authService: AuthService,
    users: UsersService,
    triggerDevices: TriggerDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._users = users;
    this._auth = authService;
    this._triggerDevices = triggerDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this._title = title;
    this.lang = this._l10n.locale.getCurrentLanguage();
    this.isMakingRequest = false;
    title.setWrappedLocalizedTitle('titles.user-trigger-history.list');
  }

  static getUserTriggerHistoryRoute(userId: number) {
    return [userId, 'trigger-history'];
  }

  refresh() {
    this.doRefreshAndUpdateComponent(() => {
      this.isMakingRequest = false;
    });
    this.isMakingRequest = true;
  }

  deleteUserTriggerId(userTriggerId: number) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'user-trigger-history.delete.question'
      },
      autoFocus: false
    }).afterClosed().subscribe(yes => {
      if (!yes) {
        return;
      }
      this.isMakingRequest = true;
      this._users.deleteUserTrigger(this.user.userId, userTriggerId).subscribe(
        () => {
          this.doRefreshAndUpdateComponent(() => {
            this.isMakingRequest = false;
            const translations = this._l10n.translate.translate(['user-trigger-history.delete.done', 'dialog.ok']);
            this._snackBar.dismiss();
            this._snackBar.open(translations['user-trigger-history.delete.done'], translations['dialog.ok']);
          });
        },
        (err: any) => {
          let msg: Nullable<string> = null;
          if (err instanceof HttpErrorResponse) {
            if (isClientHttpError(err)) {
              const code = err.error.code as ServerErrorCode;
              if (code === ServerErrorCode.NOT_FOUND) {
                msg = 'user-trigger-history.errors.not-found';
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
    this.showsIdentity = !(UserTriggerHistoryResolver.propName in this._route.snapshot.data);
    if (!this.showsIdentity) {
      this.userTriggers = this._route.snapshot.data[UserTriggerHistoryResolver.propName];
      this.user = this._route.snapshot.data[UserResolver.propName];
      this.columnsToDisplay = ['triggerDeviceName', 'triggerType', 'triggerTime', 'delete'];
    } else {
      this.userTriggers = this._route.snapshot.data[IdentityTriggerHistoryResolver.propName];
      if (this._auth.hasUser()) {
        this.user = this._auth.getUser();
      } else {
        this._auth.refreshUser().subscribe(user => this.user = user);
      }
      this.columnsToDisplay = ['triggerDeviceName', 'triggerType', 'triggerTime'];
    }
    this.saveTriggerDevices(this._route.snapshot.data[TriggerDevicesResolver.propName]);
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

  protected doRefreshAndUpdateComponent(onFinalize: () => void) {
    const requestAboutUserTriggers = this.showsIdentity
      ? this._users.getTriggerHistoryForIdentity()
      : this._users.getTriggerHistoryForUser(this.user.userId);
    return forkJoin(
      requestAboutUserTriggers,
      this._triggerDevices.getTriggerDevices(),
    ).pipe(
      finalize(onFinalize),
    ).subscribe(
      ([userTriggers, triggerDevices]) => {
        this.userTriggers = userTriggers;
        this.saveTriggerDevices(triggerDevices);
      },
      (err: any) => {
        console.error('User trigger history refresh error', err);
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
}
