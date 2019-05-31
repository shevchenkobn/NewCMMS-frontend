import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { L10nService } from '../shared/services/l10n.service';
import { Language } from 'angular-l10n';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private _route: ActivatedRoute;
  private _route$?: Subscription;
  private _l10n: L10nService;
  @Language() lang: string;
  public pathWrap: {
    path: string
  } = {
    path: ''
  };

  constructor(route: ActivatedRoute, l10nService: L10nService) {
    this._route = route;
    this._l10n = l10nService;
    this.lang = this._l10n.locale.getCurrentLanguage();
  }

  ngOnInit() {
    this._route$ = this._route.url.subscribe(value => {
      const url = this._route.snapshot.queryParams['url'] || '/' + value.join('/');
      this.pathWrap = {
        path: `<strong>${url}</strong>`,
      };
    });
  }

  ngOnDestroy() {
    if (this._route$) {
      this._route$.unsubscribe();
    }
  }
}
