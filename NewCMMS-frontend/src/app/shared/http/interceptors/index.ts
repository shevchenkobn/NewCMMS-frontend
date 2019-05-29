import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BaseUrlInterceptor } from '../base-url.interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
