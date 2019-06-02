import { Injectable } from '@angular/core';
import { IActionDevice, IActionDeviceChange } from '../../shared/models/action-device.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { assertNumericId } from '../../shared/validators/id';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionDevicesService {
  public static readonly ACTION_DEVICES_BASE = 'users/';
  public static readonly PARAMS: Readonly<{ [name: string]: string | string[] }> = {
    'select': (
      ['actionDeviceId', 'physicalAddress', 'name', 'type', 'status', 'hourlyRate'] as ReadonlyArray<keyof IActionDevice>
    ).join(','),
  };

  protected _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }

  getActionDevices() {
    return this._http.get<{ actionDevices: IActionDevice[] }>(ActionDevicesService.ACTION_DEVICES_BASE).pipe(
      map(devices => devices.actionDevices),
    );
  }

  getActionDevice(actionDeviceId: number) {
    try {
      assertNumericId(actionDeviceId, 'actionDeviceId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.get<IActionDevice>(ActionDevicesService.ACTION_DEVICES_BASE + actionDeviceId.toString(), {
      params: {
        ...ActionDevicesService.PARAMS,
      }
    });
  }

  createActionDevice(actionDevice: IActionDeviceChange, returnActionDevice?: false): Observable<null>;
  createActionDevice(actionDevice: IActionDeviceChange, returnActionDevice: true): Observable<IActionDevice>;
  createActionDevice(actionDevice: IActionDeviceChange, returnActionDevice = false) {
    const params = returnActionDevice ? {
      ...ActionDevicesService.PARAMS,
    } : {};
    return this._http.post<IActionDevice | null>(
      ActionDevicesService.ACTION_DEVICES_BASE,
      actionDevice,
      {
        params,
      },
    );
  }

  updateActionDevice(actionDeviceId: number, actionDevice: Partial<IActionDeviceChange>, returnActionDevice?: false): Observable<null>;
  updateActionDevice(
    actionDeviceId: number,
    actionDevice: Partial<IActionDeviceChange>,
    returnActionDevice: true,
  ): Observable<IActionDevice>;
  updateActionDevice(actionDeviceId: number, actionDevice: Partial<IActionDeviceChange>, returnActionDevice = false) {
    try {
      assertNumericId(actionDeviceId, 'actionDeviceId');
    } catch (err) {
      return throwError(err);
    }
    const params = returnActionDevice ? {
      ...ActionDevicesService.PARAMS,
    } : {};
    return this._http.patch<IActionDevice | null>(
      ActionDevicesService.ACTION_DEVICES_BASE + actionDeviceId.toString(),
      actionDevice,
      {
        params,
      },
    );
  }

  deleteActionDevice(actionDeviceId: number, returnActionDevice?: false): Observable<null>;
  deleteActionDevice(actionDeviceId: number, returnActionDevice: true): Observable<IActionDevice>;
  deleteActionDevice(actionDeviceId: number, returnActionDevice = false) {
    try {
      assertNumericId(actionDeviceId, 'actionDeviceId');
    } catch (err) {
      return throwError(err);
    }
    const params = returnActionDevice ? {
      ...ActionDevicesService.PARAMS,
    } : {};
    return this._http.delete<IActionDevice | null>(
      ActionDevicesService.ACTION_DEVICES_BASE + actionDeviceId.toString(),
      {
        params,
      },
    );
  }
}
