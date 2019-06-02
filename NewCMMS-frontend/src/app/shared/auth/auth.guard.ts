import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree, Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IUser, UserRoles } from '../models/user.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  static readonly roleDataProp = 'authRoles';
  protected _auth: AuthService;
  protected _router: Router;

  constructor(authService: AuthService, router: Router) {
    this._auth = authService;
    this._router = router;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuthAndRole(next);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuthAndRole(next);
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthAndRole(route);
  }

  private checkAuthAndRole(next: ActivatedRouteSnapshot | Route) {
    if (!this._auth.isLoggedIn()) {
      if (next instanceof ActivatedRouteSnapshot) {
        this.redirectToLoginFromSnapshot(next);
      } else {
        this.redirectToLoginFromRoute(next);
      }
      return false;
    }
    const requiredRoles = (next.data || {})[AuthGuard.roleDataProp] as UserRoles | undefined;
    if (typeof requiredRoles !== 'number') {
      return true;
    }
    if (this._auth.hasUser()) {
      return this.checkRoleOrRedirect(this._auth.getUser(), requiredRoles);
    }
    return this._auth.refreshUser().pipe(
      map(user => this.checkRoleOrRedirect(user, requiredRoles)),
    );
  }

  private redirectToLoginFromSnapshot(next: ActivatedRouteSnapshot) {
    this._auth.redirectUrl = next.pathFromRoot;
    this.navigate(AuthService.AUTH_LOGIN_PATH);
  }

  private redirectToLoginFromRoute(route: Route) {
    this._auth.redirectUrl = route.path;
    this.navigate(AuthService.AUTH_LOGIN_PATH);
  }

  private navigate(path: string) {
    this._router.navigateByUrl(path).catch(reason => {
      console.error('From AuthGuard: ', reason);
    });
  }

  private checkRoleOrRedirect(user: IUser, requiredRoles: UserRoles | ReadonlyArray<UserRoles>) {
    if (typeof requiredRoles === 'number') {
      const result = this.checkRole(user, requiredRoles);
      if (!result) {
        this.navigate('/');
        return false;
      }
      return true;
    } else {
      const result = this.checkRoles(user, requiredRoles);
      if (!result) {
        this.navigate('/');
        return false;
      }
      return true;
    }
  }

  private checkRole(user: IUser, requiredRoles: UserRoles) {
    return !!(user.role & requiredRoles);
  }

  private checkRoles(user: IUser, requiredRoles: ReadonlyArray<UserRoles>) {
    for (const role of requiredRoles) {
      if (this.checkRole(user, role)) {
        return true;
      }
    }
    return false;
  }
}
