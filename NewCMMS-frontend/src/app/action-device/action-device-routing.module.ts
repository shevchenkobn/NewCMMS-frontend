import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { actionDevicesBaseRoute } from '../app-routing.module';
import { AuthGuard } from '../shared/auth/auth.guard';
import { UserRoles } from '../shared/models/user.model';
import { ListComponent } from './list/list.component';
import { ActionDevicesResolver } from './resolvers/action-devices.resolver';

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
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionDeviceRoutingModule { }
