import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { L10nService } from './shared/services/l10n.service';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  static readonly defaultTitleKey: string = 'titles.default';
  readonly title: Title;
  readonly onTitleChange: Observable<string>;
  private _onTitleChange: Subject<string>;
  private _l10n: L10nService;
  private _titleKey: string;

  constructor(title: Title, l10n: L10nService) {
    this.title = title;
    this._l10n = l10n;

    this._onTitleChange = new Subject<string>();
    this.onTitleChange = this._onTitleChange.asObservable();
    this._titleKey = TitleService.defaultTitleKey;
    this._l10n.translate.translationChanged().subscribe(() => {
      this.setWrappedLocalizedTitle(this._titleKey);
    });
  }

  getWrappedLocalizedTitleOrDefault(keyPath: string): string {
    return keyPath !== TitleService.defaultTitleKey
      ? this.translateWrapped(keyPath)
      : this._l10n.translate.translate(TitleService.defaultTitleKey);
  }

  setWrappedLocalizedTitle(keyPath: string): boolean {
    this._titleKey = keyPath;
    try {
      const title = this.getWrappedLocalizedTitleOrDefault(this._titleKey);
      this.title.setTitle(title);
      this._onTitleChange.next(title);
      return true;
    } catch (err) {
      console.error('Error when setting title', err);
      return false;
    }
  }

  protected translateWrapped(keyPath: string) {
    const translation = this._l10n.translate.translate(keyPath);
    return translation && translation !== keyPath ? this._l10n.translate.translate('titles.template', {
      title: translation,
    }) : this._l10n.translate.translate(TitleService.defaultTitleKey);
  }
}
