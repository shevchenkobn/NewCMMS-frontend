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
import { TextMaskModule } from 'angular2-text-mask';

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
    TranslationModule,
    LocalizationModule,

    MaterialModule,
  ],
  providers: [
    httpInterceptorProviders,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    // BrowserAnimationsModule,
    TranslationModule,
    LocalizationModule,
    TextMaskModule,

    MaterialModule,
    ProgressBarComponent,
  ],
  entryComponents: [
    ConfirmDialogComponent,
  ]
})
export class SharedModule { }
