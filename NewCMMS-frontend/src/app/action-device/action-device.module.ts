import { NgModule } from '@angular/core';

import { ActionDeviceRoutingModule } from './action-device-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { ChangeComponent } from './change/change.component';

@NgModule({
  declarations: [ListComponent, ChangeComponent],
  imports: [
    SharedModule,
    ActionDeviceRoutingModule
  ]
})
export class ActionDeviceModule { }
