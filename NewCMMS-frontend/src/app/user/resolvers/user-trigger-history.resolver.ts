import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IUserTrigger } from '../../shared/models/user-trigger.model';
import { UsersService } from '../services/users.service';
import { Observable, of, throwError } from 'rxjs';
import { IUser } from '../../shared/models/user.model';
import { catchError } from 'rxjs/operators';
import { isClientHttpError } from '../../shared/http/server-error-utils';
import { AppError } from '../../shared/services/error.service';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { getFullPath } from '../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class UserTriggerHistoryResolver implements Resolve<IUserTrigger[]> {
  static readonly propName = 'userTriggerHistory';
  static readonly paramName = 'userId';
  protected _users: UsersService;
  protected _router: Router;

  constructor(usersService: UsersService, router: Router) {
    this._users = usersService;
    this._router = router;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<IUserTrigger[]> | Promise<IUserTrigger[]> | IUserTrigger[] {
    return this._users.getTriggerHistoryForUser(Number.parseInt(route.params[UserTriggerHistoryResolver.paramName], 10)).pipe(
      catchError((err: any) => {
        if (isClientHttpError(err) && (err.status === 404 || err.status === 400)) {
          this.navigateToNotFound(route);
          return of(null as any);
        }
        if (err instanceof AppError) {
          console.error('AppError in userTrigger resolver', err);
          this.navigateToNotFound(route);
        }
        return throwError(err);
      }),
    );
  }

  protected navigateToNotFound(route: ActivatedRouteSnapshot) {
    this._router.navigate([PageNotFoundComponent.dedicatedRoute], {
      queryParams: {
        url: getFullPath(route.pathFromRoot, false)
      }
    }).catch(navError => {
      console.error('From userTrigger by id resolve navigate', navError);
    });
  }
}
