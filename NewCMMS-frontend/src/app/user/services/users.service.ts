import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser, IUserChange } from '../../shared/models/user.model';
import { Observable, throwError } from 'rxjs';
import { assertNumericId, isNumericId } from '../../shared/validators/id';
import { map, tap } from 'rxjs/operators';
import { IUserTrigger } from '../../shared/models/user-trigger.model';
import { AuthService } from '../../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  static readonly USERS_BASE = 'users/';
  static readonly TRIGGER_HISTORY_BASE = '/trigger-history/';
  static readonly IDENTITY_TRIGGER_HISTORY_BASE = AuthService.AUTH_BASE_PATH + '/identity/trigger-history';
  static readonly PARAMS: Readonly<{ [name: string]: string | string[] }> = {
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
    try {
      assertNumericId(userId, 'userId');
    } catch (err) {
      return throwError(err);
    }
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
    try {
      assertNumericId(userId, 'userId');
    } catch (err) {
      return throwError(err);
    }
    const params: Record<string, string | string[]> = returnUser ? {
      ...UsersService.PARAMS,
    } : {};
    return this._http.patch<IUser | null>(UsersService.USERS_BASE + userId.toString(), user, {
      params
    });
  }

  deleteUser(userId: number, returnUser?: false): Observable<null>;
  deleteUser(userId: number, returnUser: true): Observable<IUser>;
  deleteUser(userId: number, returnUser = false) {
    try {
      assertNumericId(userId, 'userId');
    } catch (err) {
      return throwError(err);
    }
    const params: Record<string, string | string[]> = returnUser ? {
      ...UsersService.PARAMS,
    } : {};
    return this._http.delete<IUser | null>(UsersService.USERS_BASE + userId.toString(), params);
  }

  getTriggerHistoryForUser(userId: number): Observable<IUserTrigger[]> {
    try {
      assertNumericId(userId, 'userId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.get<{ userTriggers: any[] }>(UsersService.USERS_BASE + userId + UsersService.TRIGGER_HISTORY_BASE).pipe(
      map(body => body.userTriggers),
      tap(triggerHistory => {
        for (const trigger of triggerHistory) {
          trigger.triggerTime = new Date(trigger.triggerTime);
        }
      }),
    );
  }

  getTriggerHistoryForIdentity(): Observable<IUserTrigger[]> {
    return this._http.get<{ userTriggers: any[] }>(UsersService.IDENTITY_TRIGGER_HISTORY_BASE).pipe(
      map(body => body.userTriggers),
      tap(triggerHistory => {
        for (const trigger of triggerHistory) {
          trigger.triggerTime = new Date(trigger.triggerTime);
        }
      }),
    );
  }

  deleteUserTrigger(userId: number, userTriggerId: number): Observable<null> {
    try {
      assertNumericId(userId, 'userId');
    } catch (err) {
      return throwError(err);
    }
    try {
      assertNumericId(userTriggerId, 'userTriggerId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.delete<null>(UsersService.USERS_BASE + userId + UsersService.TRIGGER_HISTORY_BASE + userTriggerId);
  }
}
