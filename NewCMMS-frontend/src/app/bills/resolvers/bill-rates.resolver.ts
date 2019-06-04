import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {IBillRate} from '../../shared/models/bill-rate.model';
import {BillService} from '../services/bill.service';
import {Observable, of, throwError} from 'rxjs';
import {PageNotFoundComponent} from '../../page-not-found/page-not-found.component';
import {getFullPath} from '../../shared/utils';
import {catchError} from 'rxjs/operators';
import {isClientHttpError} from '../../shared/http/server-error-utils';
import {AppError} from '../../shared/services/error.service';

@Injectable({
  providedIn: 'root'
})
export class BillRatesResolver implements Resolve<IBillRate[]> {
  static readonly propName = 'billRates';
  static readonly paramName = 'billId';
  protected _bills: BillService;
  protected _router: Router;

  constructor(bills: BillService, router: Router) {
    this._bills = bills;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IBillRate[]> | Promise<IBillRate[]> | IBillRate[] {
    return this._bills.getBillRatesForBill(Number.parseInt(route.params[BillRatesResolver.paramName], 10)).pipe(
      catchError((err: any) => {
        if (isClientHttpError(err) && (err.status === 404 || err.status === 400)) {
          this.navigateToNotFound(route);
          return of(null as any);
        }
        if (err instanceof AppError) {
          console.error('AppError in billRate rates resolver', err);
          this.navigateToNotFound(route);
        }
        return throwError(err);
      }),
    );
  }

  protected navigateToNotFound(route: ActivatedRouteSnapshot) {
    this._router.navigate([PageNotFoundComponent.dedicatedRoute], {
      queryParams: {
        url: getFullPath(route.pathFromRoot, false)
      }
    }).catch(navError => {
      console.error('From billrates by id resolve navigate', navError);
    });
  }
}
