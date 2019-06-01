import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser, IUserChange } from '../../shared/models/user.model';
import { Observable } from 'rxjs';
import { isNumericId } from '../../shared/validators/id';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public static readonly USERS_BASE = 'users/';
  public static readonly PARAMS: Readonly<{ [name: string]: string | string[] }> = {
    'select': ['userId', 'email', 'role', 'fullName'].join(','),
  };

  protected _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }

  getUsers() {
    return this._http.get<{ users: IUser[] }>(UsersService.USERS_BASE).pipe(
      map(users => users.users),
    );
  }

  getUser(userId: number) {
    this.assertUserId(userId);
    return this._http.get<IUser>(UsersService.USERS_BASE + userId.toString(), {
      params: {
        ...UsersService.PARAMS,
      }
    });
  }

  createUser(user: IUserChange, returnUser?: false): Observable<null>;
  createUser(user: IUserChange, returnUser: true): Observable<IUser>;
  createUser(user: IUserChange, returnUser = false) {
    const params: Record<string, string | string[]> = returnUser ? {
      ...UsersService.PARAMS,
    } : {};
    return this._http.post<IUser | null>(UsersService.USERS_BASE, user, {
      params
    });
  }

  updateUser(userId: number, user: Partial<IUserChange>, returnUser?: false): Observable<null>;
  updateUser(userId: number, user: Partial<IUserChange>, returnUser: true): Observable<IUser>;
  updateUser(userId: number, user: Partial<IUserChange>, returnUser = false) {
    this.assertUserId(userId);
    const params: Record<string, string | string[]> = returnUser ? {
      ...UsersService.PARAMS,
    } : {};
    return this._http.post<IUser | null>(UsersService.USERS_BASE + userId.toString(), user, {
      params
    });
  }

  deleteUser(userId: number, returnUser?: false): Observable<null>;
  deleteUser(userId: number, returnUser: true): Observable<IUser>;
  deleteUser(userId: number, returnUser = false) {
    this.assertUserId(userId);
    const params: Record<string, string | string[]> = returnUser ? {
      ...UsersService.PARAMS,
    } : {};
    return this._http.delete<IUser | null>(UsersService.USERS_BASE + userId.toString(), params);
  }

  protected assertUserId(userId: number) {
    if (!isNumericId(userId)) {
      throw new TypeError('userId must be a non-negative integer');
    }
  }
}
