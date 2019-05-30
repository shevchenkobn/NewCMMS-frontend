import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SharedModule } from '../shared.module';

@Injectable({
  providedIn: SharedModule
})
export class LoginGuard implements CanActivate {
  protected _auth: AuthService;
  protected _router: Router;

  constructor(authService: AuthService, router: Router) {
    this._auth = authService;
    this._router = router;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this._auth.isLoggedIn()) {
      return true;
    }
    this._router.navigateByUrl('/').catch(err => {
      console.error('From LoginGuard error ', err);
    });
    return false;
  }
}
