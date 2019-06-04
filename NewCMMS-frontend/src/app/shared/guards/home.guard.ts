import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { IUser, UserRoles } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserTriggerHistoryComponent } from '../../user/user-trigger-history/user-trigger-history.component';
import { usersBaseRoute } from '../../routing-constants';

@Injectable({
  providedIn: CommonModule
})
export class HomeGuard implements CanActivate, CanActivateChild, CanLoad {
  protected _auth: AuthService;
  protected _router: Router;

  constructor(authService: AuthService, router: Router) {
    this._auth = authService;
    this._router = router;
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.tryActivate();
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.tryActivate();
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.tryActivate();
  }

  tryActivate() {
    if (!this._auth.hasUser()) {
      return this._auth.refreshUser().pipe(
        map(user => this.routeByRole(user)),
      );
    }
    return this.routeByRole(this._auth.getUser());
  }

  private routeByRole(user: IUser) {
    if (user.role & UserRoles.ADMIN) {
      this.redirect(usersBaseRoute);
    } else if (
      user.role & UserRoles.EMPLOYEE
    ) {
      this.redirect(UserTriggerHistoryComponent.identityRoute);
    }
    return false;
  }

  private redirect(path: string) {
    this._router.navigateByUrl(path).catch(err => {
      console.error('From HomeGuard error ', err);
    });
  }
}
