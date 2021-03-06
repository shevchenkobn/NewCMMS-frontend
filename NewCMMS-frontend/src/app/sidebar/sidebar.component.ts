import { Component, OnDestroy, OnInit } from '@angular/core';
import { L10nService } from '../shared/services/l10n.service';
import { AuthService } from '../shared/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, UserRoles } from '../shared/models/user.model';
import { Nullable } from '../@types';
import { Language } from 'angular-l10n';
import { LoginComponent } from '../login/login.component';
import { ListComponent as UserListComponent } from '../user/list/list.component';
import { ListComponent as ActionDeviceListComponent } from '../action-device/list/list.component';
import { ListComponent as TriggerDeviceListComponent } from '../trigger-device/list/list.component';
import { ListComponent as TriggerActionsListComponent } from '../trigger-action/list/list.component';
import { BillListComponent } from '../bills/bill-list/bill-list.component';
import { UserTriggerHistoryComponent } from '../user/user-trigger-history/user-trigger-history.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  l10n: L10nService;
  isLoggedIn: boolean;
  user?: Nullable<IUser>;
  userRoles = UserRoles;
  @Language() activeLang: string;
  routerLinks = { // FIXME: use static constants
    login: LoginComponent.route,
    users: UserListComponent.getAbsoluteRoute(),
    identityUserTriggerHistory: UserTriggerHistoryComponent.identityRouteLink,
    triggerDevices: TriggerDeviceListComponent.getAbsoluteRoute(),
    actionDevices: ActionDeviceListComponent.getAbsoluteRoute(),
    triggerActions: TriggerActionsListComponent.getAbsoluteRoute(),
    bills: BillListComponent.getAbsoluteRoute(),
  };
  locales = Object.entries({
    'uk': 'Українська',
    'en': 'English',
  });
  protected _auth: AuthService;
  protected _router: Router;

  private onLoginChange$!: Subscription;
  private onUserRefresh$!: Subscription;
  private onLangChange$!: Subscription;

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

    this.activeLang = l10nService.locale.getCurrentLanguage();
    this.isLoggedIn = this._auth.isLoggedIn();
  }

  hasRole(role: UserRoles) {
    return !!this.user && this.user.role & role;
  }

  selectLocale(locale: string) {
    this.l10n.selectLocale(locale);
  }

  logout() {
    this._auth.logout();
    this._router.navigateByUrl(LoginComponent.route).catch(err => {
      console.error('From sidenav logout redirect ', err);
    });
  }

  ngOnInit() {
    this.onLoginChange$ = this._auth.onLoginChange.subscribe(this.onLoginChange);
    this.onUserRefresh$ = this._auth.onUserRefresh.subscribe(user => {
      this.user = user;
    });
    this.onLangChange$ = this.l10n.translate.translationChanged().subscribe(lang => this.activeLang = lang);
    this.onLoginChange(this._auth.isLoggedIn());
  }

  ngOnDestroy() {
    this.onLoginChange$.unsubscribe();
    this.onUserRefresh$.unsubscribe();
    this.onLangChange$.unsubscribe();
  }
}
