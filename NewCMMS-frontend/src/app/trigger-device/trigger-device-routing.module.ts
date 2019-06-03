import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { triggerDevicesBaseRoute } from '../app-routing.module';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ListComponent } from './list/list.component';
import { TriggerDevicesResolver } from './resolvers/trigger-devices.resolver';
import { UserRoles } from '../shared/models/user.model';
import { ProfileResolver } from '../shared/auth/identity.resolver';

const routes: Routes = [
  {
    path: triggerDevicesBaseRoute,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: ListComponent.route,
        canActivate: [AuthGuard],
        data: { authRoles: [UserRoles.EMPLOYEE, UserRoles.ADMIN] },
        resolve: {
          identity: ProfileResolver,
          triggerDevices: TriggerDevicesResolver,
        },
        component: ListComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TriggerDeviceRoutingModule { }
