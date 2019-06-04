import { ActivatedRouteSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export function getFullPath(pathFromRoot: ActivatedRouteSnapshot[], startingSlash = true) {
  return (startingSlash ? '/' : '') + pathFromRoot.map(o => o.url.map(u => u.path).join('/')).join('/');
}

export const hexSymbolRegex = /[a-fA-F\d]/;
export const physicalAddressMask: ReadonlyArray<string | RegExp> = (
  [hexSymbolRegex, hexSymbolRegex] as ReadonlyArray<string | RegExp>
).concat(
  repeatArray<string | RegExp>([':', hexSymbolRegex, hexSymbolRegex], 5),
);

export const physicalAddressPattern = /^[A-Fa-f\d]{2}(:?[A-Fa-f\d]{2}){5}$/;
export function bindPhysicalAddressUnmask(control: AbstractControl) {
  return control.valueChanges.pipe(
    tap(value => {
      const unmaskedValue = value.toString().replace(/:/g, '');
      control.setValue(unmaskedValue, { emitEvent: false, emitModelToViewChange: false });
    }),
  ).subscribe();
}

export function repeatArray<T>(array: ReadonlyArray<T>, count: number): T[] {
  if (count <= 0) {
    throw new TypeError('count is not positive');
  }
  let arr = array;
  for (let i = 1; i < count; i++) {
    arr = arr.concat(array);
  }
  return arr as any;
}

export const dateTimeFormat: DateTimeFormatOptions = {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

export const cashFormat = '1.0-6';
