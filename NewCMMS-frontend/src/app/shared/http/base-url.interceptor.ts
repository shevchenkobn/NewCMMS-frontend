import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from './url-utils';

@Injectable({
  providedIn: 'root',
})
export class BaseUrlInterceptor implements HttpInterceptor {
  static isLocalRequest(url: string) {
    if (url.startsWith(window.location.origin)) {
      return true;
    }
    const i = url.indexOf('assets');
    return i === 0 || (url[0] === '/' && i === 1) || (url.startsWith('./') && i === 2);
  }

  constructor() {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('http://') || req.url.startsWith('https://') || BaseUrlInterceptor.isLocalRequest(req.url)) {
      return next.handle(req);
    }
    return next.handle(req.clone({
      url: getApiUrl(req.url),
    }));
  }
}
