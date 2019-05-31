import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ServerErrorCode } from '../http/error-codes';
import { Router } from '@angular/router';
import { BaseUrlInterceptor } from '../http/base-url.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private _auth: AuthService;
  private _router: Router;

  constructor(authService: AuthService, router: Router) {
    this._auth = authService;
    this._router = router;
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      (BaseUrlInterceptor.isAssetRequest(req.url))
      || AuthService.NO_AUTH_PATHS.some(([path, methods, matchFull]) => (
        (
          matchFull && req.url === path || !matchFull && req.url.startsWith(path)
        ) && (
          !methods || methods.includes(req.method)
        )
      ))
    ) {
      return next.handle(req);
    }
    if (this._auth.isAccessTokenExpired()) {
      return this._auth.refreshToken().pipe(
        switchMap(() => this.sendNormalRequest(req, next)),
      );
    }
    return this.sendNormalRequest(req, next);
  }

  private sendNormalRequest(req: HttpRequest<any>, next: HttpHandler) {
    const request = this.addAuthHeader(req);
    return next.handle(request).pipe(
      catchError(err => this.handleAccessError(err, next, request)),
    );
  }

  private handleAccessError(err: any, next: HttpHandler, request: HttpRequest<any>) {
    if (
      err instanceof HttpErrorResponse
      && err.status === 403
      && err.error && err.error.code === ServerErrorCode.AUTH_EXPIRED
    ) {
      return this._auth.refreshToken().pipe(
        switchMap(() => next.handle(this.addAuthHeader(request))),
        catchError(refreshErr => {
          if (
            refreshErr instanceof HttpErrorResponse
            && (
              (
                err.status === 403
                && err.error && err.error.code === ServerErrorCode.AUTH_EXPIRED
              ) || (
                err.status === 401
                && err.error && err.error.code === ServerErrorCode.AUTH_BAD
              )
            )
          ) {
            this.handleRefreshExpire();
          }
          return throwError(refreshErr);
        }),
      );
    }
    return throwError(err);
  }

  private addAuthHeader(req: HttpRequest<any>) {
    return req.clone({
      setHeaders: {
        // tslint:disable-next-line:object-literal-key-quotes
        'Authorization': `Bearer ${this._auth.jwt.tokenGetter()}`,
      },
    });
  }

  private handleRefreshExpire() {
    this._auth.logout();
    this._router.navigateByUrl('/login').catch(err => {
      console.error('From AuthInterceptor redirect to login');
    });
  }
}
