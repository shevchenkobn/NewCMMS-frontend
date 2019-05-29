import { Injectable } from '@angular/core';
import { getApiUrl } from '../http/url-utils';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { IUser } from '../models/user.model';
import { Maybe } from '../../@types';
import { JwtHelperService } from '@auth0/angular-jwt';
import { finalize, map, shareReplay, tap } from 'rxjs/operators';
import { SharedModule } from '../shared.module';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: SharedModule,
})
export class AuthService {
  static readonly LOCAL_STORAGE_ACCESS_TOKEN = 'accessToken';
  static readonly LOCAL_STORAGE_REFRESH_TOKEN = 'refreshToken';
  static readonly LOCAL_STORAGE_USER = 'user';

  static readonly AUTH_BASE_PATH = '/auth';
  static readonly AUTH_LOGIN_PATH = AuthService.AUTH_BASE_PATH;
  static readonly AUTH_REFRESH_PATH = AuthService.AUTH_BASE_PATH + '/refresh';
  static readonly IDENTITY_PATH = AuthService.AUTH_BASE_PATH + '/identity';
  static readonly NO_AUTH_PATHS: ReadonlyArray<[string, ReadonlyArray<string>?, boolean?]> = [
    [getApiUrl(AuthService.AUTH_REFRESH_PATH), undefined, true],
    [getApiUrl(AuthService.AUTH_LOGIN_PATH), undefined, true],
  ];

  readonly jwt: JwtHelperService;
  public redirectUrl?: ActivatedRouteSnapshot[] | string;
  public onLoginChange: Observable<boolean>;
  public onTokenRefresh: Observable<string>;
  public onUserRefresh: Observable<Readonly<IUser> | undefined>;
  protected readonly _http: HttpClient;
  protected _accessToken?: string;
  protected _accessTokenExpiration: Date;
  protected _email = '';
  protected _login$?: Observable<string>;
  protected _tokenUpdate$?: Observable<string>;
  protected _user?: Readonly<IUser>;
  protected _onLoginChange: Subject<boolean>;
  protected _onTokenRefresh: Subject<string>;
  protected _onUserRefresh: Subject<Maybe<Readonly<IUser>>>;

  constructor(http: HttpClient) {
    this._http = http;
    this.jwt = new JwtHelperService({
      tokenGetter: () => this.getAccessToken(),
    });

    this._onLoginChange = new Subject<boolean>();
    this.onLoginChange = this._onLoginChange.asObservable();
    this._onTokenRefresh = new Subject<string>();
    this.onTokenRefresh = this._onTokenRefresh.asObservable();
    this._onUserRefresh = new Subject<Readonly<IUser> | undefined>();
    this.onUserRefresh = this._onUserRefresh.asObservable();
  }

  getAccessToken() {
    if (!this._accessToken) {
      this.setAccessTokenMembers();
    }
    return this._accessToken;
  }

  isAccessTokenExpired() {
    return Date.now() < this._accessTokenExpiration.getTime();
  }

  isLoggedIn() {
    return localStorage.getItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN) !== null
      && localStorage.getItem(AuthService.LOCAL_STORAGE_ACCESS_TOKEN) !== null;
  }

  refreshToken() {
    if (this._tokenUpdate$) {
      return this._tokenUpdate$;
    }
    const refreshToken = localStorage.getItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN);
    const accessToken = this.getAccessToken();
    if (!refreshToken || !accessToken) {
      throw new Error('Needs login');
    }
    this._tokenUpdate$ = this._http.post<ITokens>(AuthService.AUTH_REFRESH_PATH, {
      accessToken,
      refreshToken,
    }, { observe: 'body' }).pipe(
      finalize(() => {
        this._tokenUpdate$ = undefined;
      }),
      tap(tokens => {
        this.saveAccessToken(tokens.accessToken);
        localStorage.setItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN, tokens.refreshToken);

        this._onTokenRefresh.next(tokens.accessToken);
      }),
      map(tokens => tokens.accessToken),
      shareReplay()
    );
    return this._tokenUpdate$;
  }

  login(email: string, password: string) {
    if (this._login$) {
      if (email !== this._email) {
        throw new Error(`Login for ${this._email} is in process`);
      }
      return this._login$;
    }

    const refreshToken = localStorage.getItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN);
    const accessToken = this.getAccessToken();
    if (refreshToken || accessToken) {
      throw new Error('No login needed');
    }

    this._email = email;
    this._login$ = this._http.post<ITokens>(AuthService.AUTH_LOGIN_PATH, {
      email,
      password,
    }, { observe: 'body' }).pipe(
      finalize(() => {
        this._email = '';
        this._login$ = undefined;
      }),
      tap(tokens => {
        this.saveAccessToken(tokens.accessToken);
        localStorage.setItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN, tokens.refreshToken);
        this._onLoginChange.next(true);
      }),
      map(tokens => tokens.accessToken),
      shareReplay(),
    );
    return this._login$;
  }

  hasUser() {
    return localStorage.getItem(AuthService.LOCAL_STORAGE_USER) !== null;
  }

  getUser() {
    if (this._user) {
      return this._user;
    }
    const userJson = localStorage.getItem(AuthService.LOCAL_STORAGE_USER);
    if (!userJson) {
      throw new Error('User is not found');
    }
    this._user = JSON.parse(userJson) as IUser;
    return this._user;
  }

  refreshUser() {
    if (!this.isLoggedIn()) {
      throw new Error('Needs login');
    }
    return this._http.get<IUser>(AuthService.IDENTITY_PATH).pipe(
      tap(user => {
        localStorage.setItem(AuthService.LOCAL_STORAGE_USER, JSON.stringify(user));
        this._user = user;
        this._onUserRefresh.next(user);
      }),
      shareReplay()
    );
  }

  setUser(user: IUser) {
    if (!this.isLoggedIn()) {
      throw new Error('Not logged in, cannot set localUser');
    }
    this._user = user;
    this._onUserRefresh.next(user);
  }

  public logout() {
    localStorage.removeItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN);
    localStorage.removeItem(AuthService.LOCAL_STORAGE_ACCESS_TOKEN);
    localStorage.removeItem(AuthService.LOCAL_STORAGE_USER);
    this._accessToken = undefined;
    this._user = undefined;
    this._onUserRefresh.next(undefined);
    this._onLoginChange.next(false);
  }

  protected getRefreshToken() {
    return localStorage.getItem(AuthService.LOCAL_STORAGE_REFRESH_TOKEN);
  }

  protected saveAccessToken(accessToken: string) {
    localStorage.setItem(AuthService.LOCAL_STORAGE_ACCESS_TOKEN, accessToken);
    this.setAccessTokenMembers(accessToken);
  }

  protected setAccessTokenMembers(accessToken = localStorage.getItem(AuthService.LOCAL_STORAGE_ACCESS_TOKEN)) {
    this._accessToken = accessToken;
    const date = this.jwt.getTokenExpirationDate(this._accessToken);
    this._accessTokenExpiration = date || new Date(8640000000000000);
  }
}
