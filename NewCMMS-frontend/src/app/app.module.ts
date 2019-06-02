import { BrowserModule, Title } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { getModuleWithProviders, L10nService } from './shared/services/l10n.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoginComponent } from './login/login.component';
import { UserModule } from './user/user.module';
import { ActionDeviceModule } from './action-device/action-device.module';

export function onAppInitProvider(l10nService: L10nService) {
  return () => {
    return l10nService.init().catch(err => {
      console.log('Error from locale init', err);
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    SidebarComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    getModuleWithProviders(),
    UserModule,
    ActionDeviceModule,
    AppRoutingModule, // it should be last
  ],
  providers: [
    Title,
    {
      provide: APP_INITIALIZER,
      useFactory: onAppInitProvider,
      deps: [L10nService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
