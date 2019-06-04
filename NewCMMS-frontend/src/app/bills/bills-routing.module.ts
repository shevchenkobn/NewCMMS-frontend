import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { billsBaseRoute } from '../app-routing.module';
import { AuthGuard } from '../shared/auth/auth.guard';
import { UserRoles } from '../shared/models/user.model';
import { BillListComponent } from './bill-list/bill-list.component';
import { TriggerDevicesResolver } from '../trigger-device/resolvers/trigger-devices.resolver';
import { BillsResolver } from './resolvers/bills.resolver';
import { BillRateListComponent } from './bill-rate-list/bill-rate-list.component';
import { ActionDevicesResolver } from '../action-device/resolvers/action-devices.resolver';
import { BillRatesResolver } from './resolvers/bill-rates.resolver';

const routes: Routes = [
  {
    path: billsBaseRoute,
    canActivateChild: [AuthGuard],
    data: { authRoles: UserRoles.ADMIN },
    children: [
      {
        path: BillListComponent.route,
        resolve: {
          bills: BillsResolver,
          triggerDevices: TriggerDevicesResolver,
        },
        component: BillListComponent,
      },
      {
        path: BillRateListComponent.routePattern,
        resolve: {
          billRates: BillRatesResolver,
          actionDevices: ActionDevicesResolver,
        },
        component: BillRateListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillsRoutingModule { }
