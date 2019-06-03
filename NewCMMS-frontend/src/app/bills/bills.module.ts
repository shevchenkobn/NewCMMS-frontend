import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillsRoutingModule } from './bills-routing.module';
import { BillListComponent } from './bill-list/bill-list.component';

@NgModule({
  declarations: [BillListComponent],
  imports: [
    CommonModule,
    BillsRoutingModule
  ]
})
export class BillsModule { }
