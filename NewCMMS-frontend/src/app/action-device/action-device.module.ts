import { NgModule } from '@angular/core';

import { ActionDeviceRoutingModule } from './action-device-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    SharedModule,
    ActionDeviceRoutingModule
  ]
})
export class ActionDeviceModule { }
