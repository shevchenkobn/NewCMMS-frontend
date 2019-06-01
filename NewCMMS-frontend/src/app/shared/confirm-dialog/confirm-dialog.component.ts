import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { IDialogData } from '../../@types';
import { Language } from 'angular-l10n';
import { L10nService } from '../services/l10n.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  @Language() lang: string;
  dialogRef: MatDialogRef<ConfirmDialogComponent>;
  data: IDialogData;
  protected _l10n: L10nService;
  protected _languageChanged$!: Subscription;

  constructor(
    dialogRef: MatDialogRef<ConfirmDialogComponent>,
    l10nService: L10nService,
    @Inject(MAT_DIALOG_DATA) data: IDialogData,
  ) {
    this.dialogRef = dialogRef;
    this._l10n = l10nService;
    this.dialogRef.disableClose = true;
    this.data = data;
    this.lang = this._l10n.locale.getCurrentLanguage();
  }

  ngOnInit() {
    this._languageChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
  }

  ngOnDestroy() {
    this._languageChanged$.unsubscribe();
  }
}

