
import { Injectable } from '@angular/core';
import { IUser } from '../../shared/models/user.model';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { UsersService } from '../services/users.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isClientHttpError } from '../../shared/http/server-error-utils';
import { getFullPath } from '../../shared/utils';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<IUser> {
  static readonly propName = 'user';
  static readonly paramName = 'userId';
  protected _users: UsersService;
  protected _router: Router;

  constructor(usersService: UsersService, router: Router) {
    this._users = usersService;
    this._router = router;
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IUser> | Promise<IUser> | IUser {
    return this._users.getUser(route.params[UserResolver.paramName]).pipe(
      catchError((err: any) => {
        if (isClientHttpError(err) && (err.status === 404 || err.status === 400)) {
          this._router.navigate([PageNotFoundComponent.dedicatedRoute], {
              queryParams: {
                url: getFullPath(route.pathFromRoot, false)
              }
            })
            .catch(navError => {
              console.error('From localUser resolve navigate', navError);
            });
          return of(null as any);
        }
        return throwError(err);
      }),
    );
  }
}