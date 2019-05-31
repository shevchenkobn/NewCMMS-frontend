import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { getModuleWithProviders } from './shared/services/l10n.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { L10nLoader } from 'angular-l10n';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    SidebarComponent,
    ProgressBarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    getModuleWithProviders(),
  ],
  providers: [
    Title,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private l10nLoader: L10nLoader) {
    this.l10nLoader.load().catch(err => {
      console.log('Error from locale init', err);
    });
  }
}
