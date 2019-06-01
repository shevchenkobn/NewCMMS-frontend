import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './http/interceptors';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    MaterialModule,
  ],
  providers: [
    httpInterceptorProviders,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    // BrowserAnimationsModule,

    MaterialModule,
  ]
})
export class SharedModule { }
