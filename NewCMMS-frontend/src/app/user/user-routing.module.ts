import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ListComponent } from './list/list.component';
import { ProfileResolver } from '../shared/auth/identity.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { ChangeComponent } from './change/change.component';
import { UserResolver } from './resolvers/user.resolver';
import { UserRoles } from '../shared/models/user.model';
import { UserTriggerHistoryComponent } from './user-trigger-history/user-trigger-history.component';
import { UserTriggerHistoryResolver } from './resolvers/user-trigger-history.resolver';
import { usersBaseRoute } from '../routing-constants';
import { TriggerDevicesResolver } from '../trigger-device/resolvers/trigger-devices.resolver';

export const routes: Routes = [
  {
    path: usersBaseRoute,
    canActivateChild: [AuthGuard],
    // canLoad: [AuthGuard],
    children: [
      {
        path: ListComponent.route,
        canActivate: [AuthGuard],
        data: { authRoles: [UserRoles.EMPLOYEE, UserRoles.ADMIN] },
        // canLoad: [AuthGuard],
        resolve: { identity: ProfileResolver, users: UsersResolver },
        component: ListComponent,
      },
      {
        path: ChangeComponent.createRoute,
        // canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        data: { authRoles: UserRoles.ADMIN },
        component: ChangeComponent,
      },
      {
        path: ChangeComponent.updateRoute,
        // canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        data: { authRoles: UserRoles.ADMIN },
        resolve: { user: UserResolver },
        component: ChangeComponent,
      },
      {
        path: UserTriggerHistoryComponent.userRoutePattern,
        canActivate: [AuthGuard],
        data: { authRoles: UserRoles.ADMIN },
        resolve: { user: UserResolver, userTriggerHistory: UserTriggerHistoryResolver, triggerDevices: TriggerDevicesResolver },
        component: UserTriggerHistoryComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
