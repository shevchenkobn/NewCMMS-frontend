import { NgModule } from '@angular/core';

import { TriggerDeviceRoutingModule } from './trigger-device-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    SharedModule,
    TriggerDeviceRoutingModule
  ]
})
export class TriggerDeviceModule { }
