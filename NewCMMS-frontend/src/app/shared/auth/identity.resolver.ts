
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IUser } from '../models/user.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileResolver implements Resolve<IUser> {
  static readonly propName = 'identity';
  protected _auth: AuthService;

  constructor(authService: AuthService) {
    this._auth = authService;
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IUser> | Promise<IUser> | IUser {
    if (this._auth.hasUser()) {
      return this._auth.getUser();
    }
    return this._auth.refreshUser();
  }
}
