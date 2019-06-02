import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ListComponent } from './list/list.component';
import { ProfileResolver } from '../shared/auth/identity.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { usersBaseRoute } from '../app-routing.module';
import { ChangeComponent } from './change/change.component';
import { UserResolver } from './resolvers/user.resolver';

export const routes: Routes = [
  {
    path: usersBaseRoute,
    canActivateChild: [AuthGuard],
    // canLoad: [AuthGuard],
    children: [
      {
        path: ListComponent.route,
        // canLoad: [AuthGuard],
        resolve: { identity: ProfileResolver, users: UsersResolver },
        component: ListComponent,
      },
      {
        path: ChangeComponent.createRoute,
        // canLoad: [AuthGuard],
        component: ChangeComponent,
      },
      {
        path: ChangeComponent.updateRoute,
        // canLoad: [AuthGuard],
        resolve: { user: UserResolver },
        component: ChangeComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
