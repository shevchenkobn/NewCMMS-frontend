import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { L10nService } from './shared/services/l10n.service';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  readonly title: Title;
  readonly onTitleChange: Observable<string>;
  private _onTitleChange: Subject<string>;
  private _l10n: L10nService;

  constructor(title: Title, l10n: L10nService) {
    this.title = title;
    this._l10n = l10n;

    this._onTitleChange = new Subject<string>();
    this.onTitleChange = this._onTitleChange.asObservable();
  }

  getWrappedLocalizedTitleOrDefault(keyPath: string): Observable<string> {
    return this._l10n.translate.get(keyPath).pipe(
      switchMap(translation => translation ? this._l10n.translate.get('titles.template', {
        title: translation,
      }) : this._l10n.translate.get('titles.default')),
    );
  }

  setWrappedLocalizedTitle(keyPath: string): Observable<boolean> {
    return this.getWrappedLocalizedTitleOrDefault(keyPath).pipe(
      map(title => {
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
  }
}
