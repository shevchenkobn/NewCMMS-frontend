import { Injectable } from '@angular/core';
import { getApiUrl } from './http/url-utils';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static readonly LOCAL_STORAGE_ACCESS_TOKEN = 'accessToken';
  static readonly LOCAL_STORAGE_REFRESH_TOKEN = 'refreshToken';
  static readonly LOCAL_STORAGE_USER = 'user';

  static readonly AUTH_BASE_PATH = '/auth';
  static readonly AUTH_LOGIN_PATH = AuthService.AUTH_BASE_PATH;
  static readonly AUTH_REFRESH_PATH = AuthService.AUTH_BASE_PATH + '/refresh';
  static readonly PROFILE_PATH = AuthService.AUTH_BASE_PATH + '/identity';
  static readonly NO_AUTH_PATHS: ReadonlyArray<[string, ReadonlyArray<string>?, boolean?]> = [
    [getApiUrl(AuthService.AUTH_REFRESH_PATH), undefined, true],
    [getApiUrl(AuthService.AUTH_LOGIN_PATH), undefined, true],
  ];

  constructor(http: HttpClient) { }
}
