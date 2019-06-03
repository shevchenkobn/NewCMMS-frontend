import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {IBill} from '../../shared/models/bill.model';
import {BillService} from '../services/bill.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillsResolver implements Resolve<IBill[]> {
  static readonly propName = 'bills';
  protected _bills: BillService;
  protected _router: Router;

  constructor(bills: BillService, router: Router) {
    this._bills = bills;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IBill[]> | Promise<IBill[]> | IBill[] {
    return this._bills.getBills();
  }
}
