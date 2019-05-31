import { Injectable } from '@angular/core';
import { SharedModule } from '../shared.module';
import { L10nConfig, LocaleService, LocalizationModule, LogLevel, ProviderType, StorageStrategy, TranslationService } from 'angular-l10n';

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
  providedIn: SharedModule
})
export class L10nService {
  static readonly locales = ['en', 'uk'] as ReadonlyArray<string>;
  translate: TranslationService;
  locale: LocaleService;

  constructor(translate: TranslationService, localeService: LocaleService) {
    this.translate = translate;
    this.locale = localeService;
  }

  selectLocale(lang: string) {
    if (!L10nService.locales.includes(lang)) {
      throw new TypeError(`Unknown locale: ${lang}`);
    }

    this.locale.setCurrentLanguage(lang);
  }
}
