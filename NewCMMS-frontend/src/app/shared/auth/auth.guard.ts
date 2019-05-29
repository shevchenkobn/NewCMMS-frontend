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
  static readonly ROUTE_DATA_PROPERTY = 'authRoles';
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

      }
      return false;
    }
    const requiredRoles = next.data[AuthGuard.ROUTE_DATA_PROPERTY] as UserRoles | undefined;
    if (typeof requiredRoles !== 'number') {
      return true;
    }
    if (this._auth.hasUser()) {
      return this.checkRole(this._auth.getUser(), requiredRoles);
    }
    return this._auth.refreshUser().pipe(
      map(user => this.checkRole(user, requiredRoles)),
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

  private checkRole(user: IUser, requiredRoles: UserRoles) {
    if (user.role & requiredRoles) {
      return true;
    }
    this.navigate('/');
    return false;
  }
}
