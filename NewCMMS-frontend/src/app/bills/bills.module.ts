import { NgModule } from '@angular/core';

import { BillsRoutingModule } from './bills-routing.module';
import { BillListComponent } from './bill-list/bill-list.component';
import { SharedModule } from '../shared/shared.module';
import { BillRateListComponent } from './bill-rate-list/bill-rate-list.component';

@NgModule({
  declarations: [BillListComponent, BillRateListComponent],
  imports: [
    SharedModule,
    BillsRoutingModule
  ]
})
export class BillsModule { }
