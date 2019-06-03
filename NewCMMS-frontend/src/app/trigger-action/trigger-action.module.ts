import { NgModule } from '@angular/core';

import { TriggerActionRoutingModule } from './trigger-action-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { ChangeComponent } from './change/change.component';

@NgModule({
  declarations: [ListComponent, ChangeComponent],
  imports: [
    SharedModule,
    TriggerActionRoutingModule
  ]
})
export class TriggerActionModule { }
