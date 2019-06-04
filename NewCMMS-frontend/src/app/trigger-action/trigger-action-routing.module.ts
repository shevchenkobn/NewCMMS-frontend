import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/auth/auth.guard';
import { TriggerActionsResolver } from './resolvers/trigger-actions.resolver';
import { TriggerDevicesResolver } from '../trigger-device/resolvers/trigger-devices.resolver';
import { ActionDevicesResolver } from '../action-device/resolvers/action-devices.resolver';
import { UserRoles } from '../shared/models/user.model';
import { ListComponent } from './list/list.component';
import { ChangeComponent } from './change/change.component';
import { TriggerActionResolver } from './resolvers/trigger-action.resolver';
import { triggerActionsBaseRoute } from '../routing-constants';

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
      {
        path: ChangeComponent.createRoute,
        resolve: {
          triggerDevices: TriggerDevicesResolver,
          actionDevices: ActionDevicesResolver,
        },
        component: ChangeComponent,
      },
      {
        path: ChangeComponent.updateRoute,
        resolve: {
          triggerAction: TriggerActionResolver,
          triggerDevices: TriggerDevicesResolver,
          actionDevices: ActionDevicesResolver,
        },
        component: ChangeComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TriggerActionRoutingModule { }
