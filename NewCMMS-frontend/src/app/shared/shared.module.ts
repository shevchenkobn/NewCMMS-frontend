import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './http/interceptors';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LocalizationModule, TranslationModule } from 'angular-l10n';



@NgModule({
  declarations: [
    ProgressBarComponent,
    ConfirmDialogComponent
  ],
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
    TranslationModule,
    LocalizationModule,
    // BrowserAnimationsModule,

    MaterialModule,
  ]
})
export class SharedModule { }
