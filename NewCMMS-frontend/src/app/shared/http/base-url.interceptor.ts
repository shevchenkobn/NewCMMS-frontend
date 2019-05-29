import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from './url-utils';
import { SharedModule } from '../shared.module';

@Injectable({
  providedIn: SharedModule
})
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor() {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      return next.handle(req);
    }
    const i = req.url.indexOf('assets');
    if (i === 0 || (req.url[0] === '/' && i === 1) || (req.url.startsWith('./') && i === 2)) {
      return next.handle(req);
    }
    return next.handle(req.clone({
      url: getApiUrl(req.url),
    }));
  }
}
