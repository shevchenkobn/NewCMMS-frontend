import { Injectable } from '@angular/core';
import {IBill} from '../../shared/models/bill.model';
import {HttpClient} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {assertNumericId} from '../../shared/validators/id';
import {IBillRate} from '../../shared/models/bill-rate.model';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  static readonly BILLS_BASE = 'bills/';
  static readonly BILLS_RATES_BASE = '/rates';
  static readonly PARAMS: Readonly<Record<string, string | string[]>> = {
    select: (
      ['billId', 'startedAt', 'finishedAt', 'sum', 'triggerDeviceId'] as ReadonlyArray<keyof IBill>
    ).join(','),
  };

  protected _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }

  getBills() {
    return this._http.get<{ bills: any[] }>(BillService.BILLS_BASE).pipe(
      map(bills => bills.bills),
      tap(bills => {
        for (const bill of bills) {
          bill.startedAt = new Date(bill.startedAt);
          bill.finishedAt = new Date(bill.finishedAt as any);
        }
      })
    ) as Observable<IBill[]>;
  }

  deleteBill(billId: number) {
    try {
      assertNumericId(billId, 'billId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.delete<null>(BillService.BILLS_BASE + billId.toString());
  }

  getBillRatesForBill(billId: number) {
    try {
      assertNumericId(billId, 'billId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.get<{ billRates: IBillRate[] }>(BillService.BILLS_BASE + billId.toString() + BillService.BILLS_RATES_BASE).pipe(
      map(billRates => billRates.billRates),
    );
  }
}
