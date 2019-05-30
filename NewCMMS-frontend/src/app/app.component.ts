import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { TitleService } from './title.service';
import { L10nService } from './shared/services/l10n.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('snav', {static: false}) snav!: MatSidenav;
  mobileQuery: MediaQueryList;

  isNavigating!: boolean;
  title: string;
  protected _router: Router;
  protected _titleService: TitleService;
  protected _l10n: L10nService;
  private _routerEvents$!: Subscription;
  private _titleChanged$!: Subscription;

  private _mobileQueryListener: (e: { matches: boolean }) => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    router: Router,
    titleService: TitleService,
    l10nService: L10nService,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = (e) => {
      changeDetectorRef.detectChanges();
      if (e.matches) {
        this.snav.close().catch(err => {
          console.error('From app root sidenav close', err);
        });
      } else {
        this.snav.open().catch(err => {
          console.error('From app root sidenav open', err);
        });
      }
    };

    this.title = 'NewCMMS';
    this._router = router;
    this._titleService = titleService;
    this._l10n = l10nService;
  }

  ngOnInit() {
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    if (!this.mobileQuery.matches) {
      this.snav.open().catch(err => {
        console.error('From app root sidenav open', err);
      });
    }
    this.isNavigating = false;
    this._routerEvents$ = this._router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (event instanceof  NavigationError) {
        this.isNavigating = false;
        console.error('Navigation error', event);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.isNavigating = false;
      }
    });
    this._titleChanged$ = this._titleService.onTitleChange.subscribe(title => {
      this.title = title;
    });
    this._l10n.translate.get('titles.default', (title: string) => this.title = title);
  }

  ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
    this._routerEvents$.unsubscribe();
    this._titleChanged$.unsubscribe();
  }

  toggleSnav() {
    this.snav.toggle().catch(err => {
      console.error('From snav toggle', err);
    });
  }
}
