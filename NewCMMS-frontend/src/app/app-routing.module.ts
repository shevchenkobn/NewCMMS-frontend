import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeGuard } from './shared/guards/home.guard';
import { AuthGuard } from './shared/auth/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';

export const usersBaseRoute = 'users';

const routes: Routes = [
  { path: LoginComponent.route, component: LoginComponent, pathMatch: 'full' },
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
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
