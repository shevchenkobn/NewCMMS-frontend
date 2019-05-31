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
      this.setWrappedLocalizedTitle(this._titleKey).subscribe();
    });
  }

  getWrappedLocalizedTitleOrDefault(keyPath: string): Observable<string> {
    return keyPath !== TitleService.defaultTitleKey ? this._l10n.translate.translateAsync(keyPath).pipe(
      switchMap(translation => {
        // console.log(translation);
        return translation ? this._l10n.translate.translateAsync('titles.template', {
          title: translation,
        }) : this._l10n.translate.translateAsync(TitleService.defaultTitleKey);
      }),
    ) : this._l10n.translate.translateAsync(TitleService.defaultTitleKey);
  }

  setWrappedLocalizedTitle(keyPath: string): Observable<boolean> {
    this._titleKey = keyPath;
    const changed$ = this.getWrappedLocalizedTitleOrDefault(this._titleKey).pipe(
      map(title => {
        // console.log(title);
        try {
          this.title.setTitle(title);
          this._onTitleChange.next(title);
          return true;
        } catch (err) {
          console.error('Error when setting title', err);
          return false;
        }
      }),
    );
    return changed$;
  }
}
