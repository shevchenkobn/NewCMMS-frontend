import { Component, OnDestroy, OnInit } from '@angular/core';
import { BillRatesResolver } from '../resolvers/bill-rates.resolver';
import { Language } from 'angular-l10n';
import { IBillRate } from '../../shared/models/bill-rate.model';
import { IActionDevice } from '../../shared/models/action-device.model';
import { cashFormat, dateTimeFormat } from '../../shared/utils';
import { forkJoin, Subscription } from 'rxjs';
import { ActionDevicesService } from '../../action-device/services/action-devices.service';
import { BillService } from '../services/bill.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TitleService } from '../../title.service';
import { ActionDevicesResolver } from '../../action-device/resolvers/action-devices.resolver';
import iterate from 'iterare';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage } from '../../shared/http/server-error-utils';
import { IBill } from '../../shared/models/bill.model';

@Component({
  selector: 'app-bill-rate-list',
  templateUrl: './bill-rate-list.component.html',
  styleUrls: ['./bill-rate-list.component.scss']
})
export class BillRateListComponent implements OnInit, OnDestroy {
  static readonly route = 'rates';
  static readonly routePattern = `:${BillRatesResolver.paramName}/${BillRateListComponent.route}`;
  @Language() lang: string;
  isMakingRequest: boolean;
  billId!: number;
  billRates!: IBillRate[];
  actionDevices!: Map<number, IActionDevice>;
  columnsToDisplay: ReadonlyArray<string>;
  dateFormat = dateTimeFormat;
  cashFormat = cashFormat;
  protected _langChanged$!: Subscription;
  protected _bills: BillService;
  protected _actionDevices: ActionDevicesService;
  protected _route: ActivatedRoute;
  protected _dialog: MatDialog;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;

  constructor(
    bills: BillService,
    actionDevices: ActionDevicesService,
    route: ActivatedRoute,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
  ) {
    this._bills = bills;
    this._actionDevices = actionDevices;
    this._route = route;
    this._dialog = dialog;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this.lang = this._l10n.locale.getCurrentLanguage();
    title.setWrappedLocalizedTitle('titles.billRate-rates.list');
    this.isMakingRequest = false;
    this.columnsToDisplay = ['actionDeviceName', 'rate'];
  }

  static getRoute(billId: number) {
    return [billId, BillRateListComponent.route];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.billId = Number.parseInt(this._route.snapshot.params[BillRatesResolver.paramName], 10);
    this.billRates = this._route.snapshot.data[BillRatesResolver.propName];
    this.saveActionDevices(this._route.snapshot.data[ActionDevicesResolver.propName]);
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
    this._langChanged$.unsubscribe();
  }

  refresh() {
    forkJoin(
      this._bills.getBillRatesForBill(this.billId),
      this._actionDevices.getActionDevices(),
    ).pipe(
      finalize(() => {
        this.isMakingRequest = false;
      }),
    ).subscribe(
      ([billRates, actionDevices]) => {
        this.billRates = billRates;
        this.saveActionDevices(actionDevices);
      },
      (err: any) => {
        console.error('Bills refresh error', err);
        this._snackBar.dismiss();
        const msg = err instanceof HttpErrorResponse && getCommonErrorMessage(err) || 'errors.unknown';
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
      }
    );
    this.isMakingRequest = true;
  }

  protected saveActionDevices(actionDevices: IActionDevice[]) {
    this.actionDevices = new Map(
      iterate(actionDevices).map(d => [d.actionDeviceId, d]) as any,
    );
  }
}
