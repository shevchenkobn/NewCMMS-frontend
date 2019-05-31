import { environment } from '../../../environments/environment';

const apiBaseUrl = !environment.host.endsWith('/') && !environment.apiRoot.startsWith('/')
  ? `${environment.host}/${environment.apiRoot}`
  : (
    environment.host.endsWith('/') && environment.apiRoot.startsWith('/')
    ? `${environment.host}${environment.apiRoot.slice(1)}`
    : `${environment.host}${environment.apiRoot}`
  );

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function getApiUrl(url: string) {
  return !url.startsWith('/') ? `${apiBaseUrl}/${url}` : `${apiBaseUrl}${url}`;
}

export function getNormalizedApiRoot() {
  return environment.apiRoot.endsWith('/')
    ? environment.apiRoot.slice(0, -1)
    : environment.apiRoot;
}
