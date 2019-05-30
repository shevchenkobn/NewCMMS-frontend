import { Injectable } from '@angular/core';
import { SharedModule } from '../shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/l10n/', '.json');
}

export function getModuleWithProviders() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
    useDefaultLang: true,
  });
}

const LOCALE_KEY = 'locale';

@Injectable({
  providedIn: SharedModule
})
export class L10nService {
  static readonly locales = ['en', 'uk'] as ReadonlyArray<string>;
  static readonly defaultLocale = L10nService.locales[0];
  translate: TranslateService;

  constructor(translate: TranslateService) {
    this.translate = translate;

    this.init();
  }

  selectLocale(lang: string) {
    if (!L10nService.locales.includes(lang)) {
      throw new TypeError(`Unknown locale: ${lang}`);
    }

    this.translate.use(lang);
    localStorage.setItem(LOCALE_KEY, lang);
  }

  private init() {
    this.translate.addLangs(L10nService.locales.slice());

    let locale = localStorage.getItem(LOCALE_KEY);
    if (!locale) {
      const currentLocale = this.translate.getBrowserCultureLang();
      if (!currentLocale) {
        return;
      }
      const localePieces = currentLocale.split(/[_-]/g);
      localePieces[1] = localePieces[1].toUpperCase();
      const browserLocale = localePieces.join('-');
      if (L10nService.locales.includes(browserLocale)) {
        locale = browserLocale;
      }
    }
    if (!locale) {
      const language = this.translate.getBrowserLang().toLowerCase();
      if (L10nService.locales.includes(language)) {
        locale = language;
      }
    }
    if (!locale) {
      locale = L10nService.defaultLocale;
    }
    this.translate.setDefaultLang(locale);
    localStorage.setItem(LOCALE_KEY, locale);
  }
}
