import { Component, OnInit } from '@angular/core';
import { L10nService } from '../shared/services/l10n.service';
import { AuthService } from '../shared/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, UserRoles } from '../shared/models/user.model';
import { Nullable } from '../@types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  l10n: L10nService;
  isLoggedIn: boolean;
  user?: Nullable<IUser>;
  userRoles = UserRoles;
  activeLocale: string;
  routerLinks = { // FIXME: use static constants
    login: 'login/',
    users: 'users/',
    identity: 'identity/',
    triggerDevices: 'trigger-devices/',
    actionDevices: 'action-devices/',
    bills: 'bills/',
  };
  locales = Object.entries({
    'uk': 'Українська',
    'en': 'English',
  });
  protected _auth: AuthService;
  protected _router: Router;

  private onLoginChange$!: Subscription;
  private onUserRefresh$!: Subscription;

  private onLoginChange = (isLoggedIn: boolean) => {
    this.isLoggedIn = isLoggedIn;
    if (isLoggedIn && !this.user) {
      this._auth.refreshUser().subscribe(
        user => this.user = user,
        error1 => {
          console.error('From sidenav refresh localUser ', error1);
        },
      );
    }
  }

  constructor(l10nService: L10nService, authService: AuthService, router: Router) {
    this.l10n = l10nService;
    this._auth = authService;
    this._router = router;

    this.activeLocale = l10nService.translate.getDefaultLang();
    this.isLoggedIn = this._auth.isLoggedIn();
  }

  hasRole(role: UserRoles) {
    return !!this.user && this.user.role & role;
  }

  selectLocale(locale: string) {
    this.l10n.selectLocale(locale);
    this.activeLocale = locale;
  }

  logout() {
    this._auth.logout();
    this._router.navigateByUrl('/login').catch(err => { // FIXME: use static constant for path
      console.error('From sidenav logout redirect ', err);
    });
  }

  ngOnInit() {
    this.onLoginChange$ = this._auth.onLoginChange.subscribe(this.onLoginChange);
    this.onUserRefresh$ = this._auth.onUserRefresh.subscribe(user => {
      this.user = user;
    });
    this.onLoginChange(this._auth.isLoggedIn());
  }
}
