import { Component, OnDestroy, OnInit } from '@angular/core';
import {Language} from 'angular-l10n';
import {ITriggerDevice} from '../../shared/models/trigger-device.model';
import { IBill } from '../../shared/models/bill.model';
import { forkJoin, Subscription } from 'rxjs';
import { TriggerDevicesService } from '../../trigger-device/services/trigger-devices.service';
import { BillService } from '../services/bill.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TitleService } from '../../title.service';
import { billsBaseRoute } from '../../app-routing.module';
import { TriggerDevicesResolver } from '../../trigger-device/resolvers/trigger-devices.resolver';
import { BillsResolver } from '../resolvers/bills.resolver';
import iterate from 'iterare';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, isClientHttpError, ServerErrorCode } from '../../shared/http/server-error-utils';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Nullable } from '../../@types';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { cashFormat, dateTimeFormat } from '../../shared/utils';
import { BillRateListComponent } from '../bill-rate-list/bill-rate-list.component';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.scss']
})
export class BillListComponent implements OnInit, OnDestroy {
  static readonly route = '';
  @Language() lang: string;
  isMakingRequest: boolean;
  bills!: IBill[];
  triggerDevices!: Map<number, ITriggerDevice>;
  columnsToDisplay: ReadonlyArray<string>;
  routerLinks = {
    getRatesRoute: BillRateListComponent.getRoute,
  };
  dateFormat = dateTimeFormat;
  cashFormat = cashFormat;
  protected _langChanged$!: Subscription;
  protected _bills: BillService;
  protected _triggerDevices: TriggerDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    bills: BillService,
    triggerDevices: TriggerDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._bills = bills;
    this._triggerDevices = triggerDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.bills.list');
    this.isMakingRequest = false;
    this.columnsToDisplay = ['triggerDeviceName', 'startedAt', 'finishedAt', 'sum', 'rates', 'delete'];
  }

  static getAbsoluteRoute() {
    return [billsBaseRoute];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.bills = this._route.snapshot.data[BillsResolver.propName];
    this.saveTriggerDevices(this._route.snapshot.data[TriggerDevicesResolver.propName]);
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

  refresh() {
    this.doRefreshAndUpdateComponent(() => {
      this.isMakingRequest = false;
    });
    this.isMakingRequest = true;
  }

  deleteBill(billId: number) {
    this._dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'billRate.delete.question'
      },
      autoFocus: false
    }).afterClosed().subscribe(yes => {
      if (!yes) {
        return;
      }
      this.isMakingRequest = true;
      this._bills.deleteBill(billId).subscribe(
        () => {
          this.doRefreshAndUpdateComponent(() => {
            this.isMakingRequest = false;
            const translations = this._l10n.translate.translate(['billRate.delete.done', 'dialog.ok']);
            this._snackBar.dismiss();
            this._snackBar.open(translations['billRate.delete.done'], translations['dialog.ok']);
          });
        },
        (err: any) => {
          let msg: Nullable<string> = null;
          if (err instanceof HttpErrorResponse) {
            if (isClientHttpError(err)) {
              const code = err.error.code as ServerErrorCode;
              if (code === ServerErrorCode.NOT_FOUND) {
                msg = 'billRate' +
                  '.errors.not-found';
              }
            }
            if (!msg) {
              msg = getCommonErrorMessage(err);
            }
          }
          if (!msg) {
            msg = 'errors.unknown';
          }
          this._snackBar.dismiss();
          const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
          this._snackBar.open(translations[msg], translations['dialog.ok']);
        },
      );
    });
  }

  protected doRefreshAndUpdateComponent(onFinalize: () => void) {
    return forkJoin(
      this._bills.getBills(),
      this._triggerDevices.getTriggerDevices(),
    ).pipe(
      finalize(onFinalize),
    ).subscribe(
      ([bills, triggerDevices]) => {
        this.bills = bills;
        this.saveTriggerDevices(triggerDevices);
      },
      (err: any) => {
        console.error('Bills refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      }
    );
  }

  protected saveTriggerDevices(triggerDevices: ITriggerDevice[]) {
    this.triggerDevices = new Map(
      iterate(triggerDevices).map(d => [d.triggerDeviceId, d]) as any,
    );
  }
}
