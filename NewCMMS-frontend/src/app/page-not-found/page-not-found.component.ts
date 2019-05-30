import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private _route: ActivatedRoute;
  private _route$?: Subscription;
  public pathWrap: {
    path: string
  } = {
    path: ''
  };

  constructor(route: ActivatedRoute) {
    this._route = route;
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
