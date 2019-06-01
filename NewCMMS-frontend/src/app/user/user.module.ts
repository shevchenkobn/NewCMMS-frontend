import { NgModule } from '@angular/core';

import { UserRoutingModule } from './user-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { ChangeComponent } from './change/change.component';

@NgModule({
  declarations: [ListComponent, ChangeComponent],
  imports: [
    SharedModule,
    UserRoutingModule
  ],
  exports: [
    UserRoutingModule,
  ]
})
export class UserModule { }
