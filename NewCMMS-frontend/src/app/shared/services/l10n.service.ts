import { Injectable } from '@angular/core';
import {
  L10nConfig,
  L10nLoader,
  LocaleService,
  LocalizationModule,
  LogLevel,
  ProviderType,
  StorageStrategy,
  TranslationService,
} from 'angular-l10n';
import { Observable, Subject, Subscription } from 'rxjs';

const l10nConfig: L10nConfig = {
  logger: {
    level: LogLevel.Warn
  },
  locale: {
    languages: [
      { code: 'en', dir: 'ltr' },
      { code: 'uk', dir: 'ltr' }
    ],
    defaultLocale: { languageCode: 'en', countryCode: 'US' },
    currency: 'USD',
    storage: StorageStrategy.Local
  },
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale-' }
    ],
    caching: true,
    composedKeySeparator: '.',
  }
};

export function getModuleWithProviders() {
  return LocalizationModule.forRoot(l10nConfig);
}

@Injectable({
  providedIn: 'root'
})
export class L10nService {
  static readonly locales = ['en', 'uk'] as ReadonlyArray<string>;
  translate: TranslationService;
  locale: LocaleService;
  languageCodeChangedLoadFinished: Observable<string>;
  protected _languageCodeChangedLoadFinished: Subject<string>;
  protected _loader: L10nLoader;

  constructor(translate: TranslationService, localeService: LocaleService, loader: L10nLoader) {
    this.translate = translate;
    this.locale = localeService;
    this._loader = loader;
    this._languageCodeChangedLoadFinished = new Subject();
    this.languageCodeChangedLoadFinished = this._languageCodeChangedLoadFinished.asObservable();
    this.locale.languageCodeChanged.subscribe(lang => {
      this.init().then(() => this._languageCodeChangedLoadFinished.next(lang));
    });
    this.init();
  }

  selectLocale(lang: string) {
    if (!L10nService.locales.includes(lang)) {
      throw new TypeError(`Unknown locale: ${lang}`);
    }

    this.locale.setCurrentLanguage(lang);
  }

  init() {
    const promise = this._loader.load();
    promise.catch(err => {
      console.error('Error when l10n init', err);
    });
    return promise;
  }
}
