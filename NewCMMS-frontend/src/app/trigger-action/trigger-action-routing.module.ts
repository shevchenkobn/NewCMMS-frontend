import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { triggerActionsBaseRoute } from '../app-routing.module';
import { AuthGuard } from '../shared/auth/auth.guard';
import { TriggerActionsResolver } from './resolvers/trigger-actions.resolver';
import { TriggerDevicesResolver } from '../trigger-device/resolvers/trigger-devices.resolver';
import { ActionDevicesResolver } from '../action-device/resolvers/action-devices.resolver';
import { UserRoles } from '../shared/models/user.model';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: triggerActionsBaseRoute,
    canActivateChild: [AuthGuard],
    data: { authRoles: UserRoles.ADMIN },
    children: [
      {
        path: ListComponent.route,
        resolve: {
          triggerActions: TriggerActionsResolver,
          triggerDevices: TriggerDevicesResolver,
          actionDevices: ActionDevicesResolver,
        },
        component: ListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TriggerActionRoutingModule { }
