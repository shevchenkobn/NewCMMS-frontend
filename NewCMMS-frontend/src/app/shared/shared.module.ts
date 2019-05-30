import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './http/interceptors';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule, MatSidenavModule } from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,

    MatCardModule,
    MatSidenavModule,
  ],
  providers: [
    httpInterceptorProviders
  ],
  exports: [
    CommonModule,
    TranslateModule,
  ]
})
export class SharedModule { }
