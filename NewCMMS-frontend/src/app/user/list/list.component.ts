import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { IUser, superUserId, userRoleNames, UserRoles, userRoleToObject } from '../../shared/models/user.model';
import { finalize, switchMap } from 'rxjs/operators';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Language } from 'angular-l10n';
import { Subscription } from 'rxjs';
import { ProfileResolver } from '../../shared/auth/identity.resolver';
import { UsersResolver } from '../resolvers/users.resolver';
import { TitleService } from '../../title.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Nullable } from '../../@types';
import { ChangeComponent } from '../change/change.component';
import { UserTriggerHistoryComponent } from '../user-trigger-history/user-trigger-history.component';
import { usersBaseRoute } from '../../routing-constants';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  static readonly route = '';
  readonly superUserId = superUserId;
  @Language() lang: string;
  currentUser!: IUser;
  isMakingRequest: boolean;
  roleNames = userRoleNames;
  users!: IUser[];
  isUserAdmin!: boolean;
  usersRoles!: ({ [role: string]: boolean })[];
  columnsToDisplay!: ReadonlyArray<string>;
  routerLinks = {
    create: ChangeComponent.createRoute,
    getEditRoute: ChangeComponent.getUpdateRoute,
    getUserTriggerHistoryRoute: UserTriggerHistoryComponent.getUserTriggerHistoryRoute
  };
  protected _langChanged$!: Subscription;
  protected _users: UsersService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    users: UsersService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._users = users;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.users.list');
    this.isMakingRequest = false;
  }

  static getAbsoluteRoute() {
    return [usersBaseRoute];
  }

  refresh() {
    this._users.getUsers().pipe(
      finalize(() => {
        this.isMakingRequest = false;
      }),
    ).subscribe(
      users => this.saveUsers(users),
      err => {
        console.error('User refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      }
    );
    this.isMakingRequest = true;
  }

  deleteUser(userId: number) {
    if (!(this.currentUser.role & UserRoles.ADMIN) || userId === this.currentUser.userId || userId === this.superUserId) {
      return;
    }
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'user.delete.question'
      },
      autoFocus: false
    }).afterClosed().subscribe(yes => {
      if (!yes) {
        return;
      }
      this.isMakingRequest = true;
      this._users.deleteUser(userId).pipe(
        switchMap(() => {
          return this._users.getUsers();
        }),
        finalize(() => {
          this.isMakingRequest = false;
        }),
      ).subscribe(
        (users) => {
          this.saveUsers(users);
          const translations = this._l10n.translate.translate(['user.delete.done', 'dialog.ok']);
          this._snackBar.dismiss();
          this._snackBar.open(translations['user.delete.done'], translations['dialog.ok']);
        },
        (err: any) => {
          let msg: Nullable<string> = null;
          if (err instanceof HttpErrorResponse) {
            if (isClientHttpError(err)) {
              const code = err.error.code as ServerErrorCode;
              if (code === ServerErrorCode.NOT_FOUND) {
                msg = 'user.errors.not-found';
              } else if (code === ServerErrorCode.AUTH_ROLE) {
                msg = 'user.delete.errors.delete-not-allowed';
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
    this.saveUsers(this._route.snapshot.data[UsersResolver.propName] as IUser[]);
    this.currentUser = this._route.snapshot.data[ProfileResolver.propName];
    this.isUserAdmin = !!(this.currentUser.role & UserRoles.ADMIN);
    this.columnsToDisplay = this.isUserAdmin
      ? ['name', 'email', 'role', 'userTriggerHistory', 'edit', 'delete']
      : ['name', 'email', 'role'];
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

  saveUsers(users: IUser[]) {
    this.users = users;
    this.usersRoles = users.map(userRoleToObject);
  }
}
