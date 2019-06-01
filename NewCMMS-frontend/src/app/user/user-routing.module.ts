import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/auth/auth.guard';
import { ListComponent } from './list/list.component';
import { ProfileResolver } from '../shared/auth/identity.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { usersBaseRoute } from '../app-routing.module';

const routes: Routes = [
  {
    path: usersBaseRoute,
    canActivateChild: [AuthGuard],
    canLoad: [AuthGuard],
    children: [
      {
        path: ListComponent.route,
        canLoad: [AuthGuard],
        resolve: { [ProfileResolver.propName]: ProfileResolver, [UsersResolver.propName]: UsersResolver },
        component: ListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
