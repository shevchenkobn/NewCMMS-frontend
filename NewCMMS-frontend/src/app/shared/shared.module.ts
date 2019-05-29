import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './http/interceptors';

@NgModule({
  declarations: [],
  providers: [
    httpInterceptorProviders
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
