import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeGuard } from './shared/guards/home.guard';
import { AuthGuard } from './shared/auth/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { UserTriggerHistoryComponent } from './user/user-trigger-history/user-trigger-history.component';
import { LoginGuard } from './shared/guards/login.guard';
import { UserRoles } from './shared/models/user.model';
import { IdentityTriggerHistoryResolver } from './user/resolvers/identity-trigger-history.resolver';
import { TriggerDevicesResolver } from './trigger-device/resolvers/trigger-devices.resolver';

const routes: Routes = [
  { path: LoginComponent.route, canActivate: [LoginGuard], component: LoginComponent, pathMatch: 'full' },
  {
    path: UserTriggerHistoryComponent.identityRoute,
    canActivate: [AuthGuard],
    data: { authRoles: UserRoles.EMPLOYEE },
    resolve: { identityTriggerHistory: IdentityTriggerHistoryResolver, triggerDevices: TriggerDevicesResolver },
    component: UserTriggerHistoryComponent,
  },
  { path: PageNotFoundComponent.dedicatedRoute, component: PageNotFoundComponent, pathMatch: 'full' },
  {
    path: '',
    canActivate: [AuthGuard, HomeGuard],
    pathMatch: 'full',
    component: PageNotFoundComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];

export function errorHandler(err: any) {
  console.error('Navigation error', err);
}

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    errorHandler,
    useHash: true,
    onSameUrlNavigation: 'reload',
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'corrected',
    enableTracing: false,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
