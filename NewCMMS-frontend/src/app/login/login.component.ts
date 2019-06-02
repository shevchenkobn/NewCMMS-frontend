import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { L10nService } from '../shared/services/l10n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/auth/auth.service';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { Language } from 'angular-l10n';
import { finalize } from 'rxjs/operators';
import { isClientHttpError } from '../shared/http/server-error-utils';
import { Subscription } from 'rxjs';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  static readonly route = 'login';
  @Language() lang: string;
  l10n: L10nService;
  redirectWrap = {
    redirect: '',
  };
  public isMakingRequest = false;
  form!: FormGroup;
  protected _fb: FormBuilder;
  protected _auth: AuthService;
  protected _router: Router;
  protected _snackBar: MatSnackBar;
  // protected _lastSnackBar?: MatSnackBarRef<SimpleSnackBar>;
  protected _langChange?: Subscription;
  protected _redirectUrl = '';

  get controls() {
    return this.form.controls;
  }

  constructor(
    authService: AuthService,
    router: Router,
    l10nService: L10nService,
    snackBar: MatSnackBar,
    formBuilder: FormBuilder,
    title: TitleService,
  ) {
    this._auth = authService;
    this._router = router;
    this.l10n = l10nService;
    this._snackBar = snackBar;
    this._fb = formBuilder;

    this.lang = this.l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.login');
  }

  ngOnInit() {
    this.initializeForm();
    this.setRedirectMessage();
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    if (this._langChange) {
      this._langChange.unsubscribe();
    }
  }

  submit() {
    this._auth.login(
      this.form.controls.email.value,
      this.form.controls.password.value,
    ).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      })
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        this._router.navigateByUrl('/').catch(err => {
          console.error('Navigate from login page: ', err);
        });
      },
      err => {
        const msg = isClientHttpError(err)
          ? 'login-page.error.client-msg'
          : 'errors.network';
        console.error(err);
        const translations = this.l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      }
    );
    this.form.disable({onlySelf: false, emitEvent: true});
    this.form.controls.password.setValue('');
    this.isMakingRequest = true;
  }

  protected setRedirectMessage() {
    if (this._auth.redirectUrl) {
      this.redirectWrap.redirect = `<strong>${this._redirectUrl}</strong>`;
    } else {
      this._langChange = this.l10n.languageCodeChangedLoadFinished.subscribe(() => {
        this.updateRedirectMessage();
      });
      this.updateRedirectMessage();
    }
  }

  protected updateRedirectMessage() {
    this.redirectWrap.redirect = this.l10n.translate.translate('login-page.home');
  }

  private initializeForm() {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
}
