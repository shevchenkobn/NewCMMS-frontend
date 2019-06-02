import { ActivatedRouteSnapshot } from '@angular/router';

export function getFullPath(pathFromRoot: ActivatedRouteSnapshot[], startingSlash = true) {
  return (startingSlash ? '/' : '') + pathFromRoot.map(o => o.url.map(u => u.path).join('/')).join('/');
}
