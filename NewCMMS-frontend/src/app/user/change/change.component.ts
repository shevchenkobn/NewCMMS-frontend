import { Component, OnDestroy, OnInit } from '@angular/core';
import { IUser, IUserChange, userRoleFromObject, userRoleNames, userRoleToObject } from '../../shared/models/user.model';
import { Language } from 'angular-l10n';
import { Subscription } from 'rxjs';
import { UsersService } from '../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../title.service';
import { userRoleValidator } from '../validators/user-role';
import { userChangedValidator } from '../validators/user-changed';
import { tap } from 'rxjs/operators';
import {
  getUserUpdateOrCreateErrorMessage,
} from '../../shared/http/server-error-utils';
import { UserResolver } from '../resolvers/user.resolver';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit, OnDestroy {
  static readonly createRoute = 'create';
  static readonly updateRoute = `${UserResolver.paramName}/edit`;

  @Language() lang: string;
  // title!: string;
  // submitLabel!: string;
  isMakingRequest: boolean;
  user?: IUser;
  form!: FormGroup;
  roleNames = userRoleNames;
  userRoles!: Record<string, boolean>;
  protected _langChanged$!: Subscription;
  protected _users: UsersService;
  protected _fb: FormBuilder;
  protected _route: ActivatedRoute;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;
  protected _title: TitleService;
  protected _snackBarWithError: boolean;

  get controls() {
    return this.form.controls;
  }

  constructor(
    users: UsersService,
    formBuilder: FormBuilder,
    route: ActivatedRoute,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._users = users;
    this._fb = formBuilder;
    this._route = route;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this._title = title;
    this.lang = this._l10n.locale.getCurrentLanguage();
    this._snackBarWithError = false;
    this.isMakingRequest = false;
  }

  static getUpdateRoute(userId: number) {
    return [userId, 'edit'];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.user = this._route.snapshot.data[UserResolver.propName];
    this.userRoles = userRoleToObject(this.user);
    const concreteUserRoleValidator = userRoleValidator(this.userRoles);
    if (!this.user) {
      // create
      this._title.setWrappedLocalizedTitle('titles.users.create');
      // this.submitLabel = this._l10n.translate.translate('user.create.submit');
      this.form = this._fb.group({
        email: ['', [Validators.required, Validators.email]],
        fullName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/)]],
      }, { validators: [concreteUserRoleValidator] });
    } else {
      // update
      this._title.setWrappedLocalizedTitle('titles.users.update');
      // this.submitLabel = this._l10n.translate.translate('user.update.submit');
      this.form = this._fb.group({
        email: [this.user.email, [Validators.required, Validators.email]],
        fullName: [this.user.fullName, [Validators.required]],
        password: ['', [Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/)]],
      }, { validators: [concreteUserRoleValidator, userChangedValidator(this.user, this.userRoles)] });
    }
  }

  ngOnDestroy() {
    this._langChanged$.unsubscribe();
    if (this._snackBarWithError) {
      this._snackBar.dismiss();
    }
  }

  toggleRole(roleName: string) {
    this.userRoles[roleName] = !this.userRoles[roleName];
    this.form.updateValueAndValidity();
  }

  update() {
    const changedUser = this.getUserFromForm();
    this._users.updateUser(this.user!.userId, changedUser).pipe(
      tap(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['user.update.done', 'dialog.ok']);
        this._snackBar.open(translations['user.update.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
      },
      err => {
        const msg = getUserUpdateOrCreateErrorMessage(err);
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
        this._snackBarWithError = true;
      },
    );
    this.isMakingRequest = true;
    this.form.disable({onlySelf: false, emitEvent: true});
  }

  create() {
    const newUser = this.getUserFromForm() as IUserChange;
    this._users.createUser(newUser).pipe(
      tap(() => {
        this.isMakingRequest = false;
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['user.create.done', 'dialog.ok']);
        this._snackBar.open(translations['user.create.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
      },
      err => {
        const msg = getUserUpdateOrCreateErrorMessage(err);
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
        this._snackBarWithError = true;
      }
    );
    this.isMakingRequest = true;
  }

  getUserFromForm(): Partial<IUserChange> | IUserChange {
    if (!this.user) {
      return {
        email: this.controls.email.value,
        fullName: this.controls.fullName.value,
        password: this.controls.password.value,
        role: userRoleFromObject(this.userRoles),
      };
    }
    const userChange = {} as Partial<IUserChange>;
    if (this.user.email !== this.controls.email.value) {
      userChange.email = this.controls.email.value;
    }
    if (this.user.fullName !== this.controls.fullName.value) {
      userChange.fullName = this.controls.fullName.value;
    }
    if (!!this.controls.password.value) {
      userChange.password = this.controls.password.value;
    }
    const role = userRoleFromObject(this.userRoles);
    if (this.user.role !== role) {
      userChange.role = role;
    }
    return userChange;
  }
}
