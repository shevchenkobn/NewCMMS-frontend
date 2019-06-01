import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { IUser } from '../../shared/models/user.model';
import { UsersService } from '../services/users.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersResolver implements Resolve<IUser[]> {
  static readonly propName = 'users';
  protected _users: UsersService;

  constructor(users: UsersService) {
    this._users = users;
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IUser[]> | Promise<IUser[]> | IUser[] {
    return this._users.getUsers();
  }
}
