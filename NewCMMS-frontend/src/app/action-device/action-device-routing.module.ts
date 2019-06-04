import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/auth/auth.guard';
import { UserRoles } from '../shared/models/user.model';
import { ListComponent } from './list/list.component';
import { ActionDevicesResolver } from './resolvers/action-devices.resolver';
import { ChangeComponent } from './change/change.component';
import { ActionDeviceResolver } from './resolvers/action-device.resolver';
import { actionDevicesBaseRoute } from '../routing-constants';

const routes: Routes = [
  {
    path: actionDevicesBaseRoute,
    canActivateChild: [AuthGuard],
    data: { authRoles: UserRoles.ADMIN },
    children: [
      {
        path: ListComponent.route,
        resolve: { actionDevices: ActionDevicesResolver },
        component: ListComponent,
      },
      {
        path: ChangeComponent.createRoute,
        component: ChangeComponent,
      },
      {
        path: ChangeComponent.updateRoute,
        resolve: { actionDevice: ActionDeviceResolver },
        component: ChangeComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionDeviceRoutingModule { }
