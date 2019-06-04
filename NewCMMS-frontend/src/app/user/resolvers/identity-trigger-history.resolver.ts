import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IUserTrigger } from '../../shared/models/user-trigger.model';
import { UsersService } from '../services/users.service';
import { AuthService } from '../../shared/auth/auth.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IdentityTriggerHistoryResolver implements Resolve<IUserTrigger[]> {
  static readonly propName = 'identityTriggerHistory';
  protected _users: UsersService;
  protected _router: Router;

  constructor(authService: AuthService, usersService: UsersService, router: Router) {
    this._users = usersService;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IUserTrigger[]> | Promise<IUserTrigger[]> | IUserTrigger[] {
    return this._users.getTriggerHistoryForIdentity();
  }
}
