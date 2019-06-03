import { Injectable } from '@angular/core';
import { ITriggerDevice, ITriggerDeviceChange } from '../../shared/models/trigger-device.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { assertNumericId } from '../../shared/validators/id';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriggerDevicesService {
  public static readonly TRIGGER_DEVICES_BASE = 'trigger-devices/';
  public static readonly PARAMS: Readonly<Record<string, string | string[]>> = {
    'select': (
      ['triggerDeviceId', 'physicalAddress', 'name', 'type', 'status'] as ReadonlyArray<keyof ITriggerDevice>
    ).join(','),
  };

  protected _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }

  getTriggerDevices() {
    return this._http.get<{ triggerDevices: ITriggerDevice[] }>(TriggerDevicesService.TRIGGER_DEVICES_BASE).pipe(
      map(devices => devices.triggerDevices),
    );
  }

  getTriggerDevice(triggerDeviceId: number) {
    try {
      assertNumericId(triggerDeviceId, 'triggerDeviceId');
    } catch (err) {
      return throwError(err);
    }
    return this._http.get<ITriggerDevice>(TriggerDevicesService.TRIGGER_DEVICES_BASE + triggerDeviceId.toString(), {
      params: {
        ...TriggerDevicesService.PARAMS,
      }
    });
  }

  createTriggerDevice(triggerDevice: ITriggerDeviceChange, returnTriggerDevice?: false): Observable<null>;
  createTriggerDevice(triggerDevice: ITriggerDeviceChange, returnTriggerDevice: true): Observable<null>;
  createTriggerDevice(triggerDevice: ITriggerDeviceChange, returnTriggerDevice = false) {
    const params = returnTriggerDevice ? {
      ...TriggerDevicesService.PARAMS,
    } : {};
    return this._http.post<ITriggerDevice | null>(
      TriggerDevicesService.TRIGGER_DEVICES_BASE,
      triggerDevice,
      {
        params,
      }
    );
  }

  updateTriggerDevice(triggerDeviceId: number, triggerDevice: Partial<ITriggerDeviceChange>, returnTriggerDevice?: false): Observable<null>;
  updateTriggerDevice(triggerDeviceId: number, triggerDevice: Partial<ITriggerDeviceChange>, returnTriggerDevice: true): Observable<null>;
  updateTriggerDevice(triggerDeviceId: number, triggerDevice: Partial<ITriggerDeviceChange>, returnTriggerDevice = false) {
    try {
      assertNumericId(triggerDeviceId, 'triggerDeviceId');
    } catch (err) {
      return throwError(err);
    }
    const params = returnTriggerDevice ? {
      ...TriggerDevicesService.PARAMS,
    } : {};
    return this._http.patch<ITriggerDevice | null>(
      TriggerDevicesService.TRIGGER_DEVICES_BASE + triggerDeviceId.toString(),
      triggerDevice,
      {
        params,
      },
    );
  }

  deleteTriggerDevice(triggerDeviceId: number, returnTriggerDevice?: false): Observable<null>;
  deleteTriggerDevice(triggerDeviceId: number, returnTriggerDevice: true): Observable<null>;
  deleteTriggerDevice(triggerDeviceId: number, returnTriggerDevice = false) {
    try {
      assertNumericId(triggerDeviceId, 'actionDeviceId');
    } catch (err) {
      return throwError(err);
    }
    const params = returnTriggerDevice ? {
      ...TriggerDevicesService.PARAMS,
    } : {};
    return this._http.delete<ITriggerDevice | null>(
      TriggerDevicesService.TRIGGER_DEVICES_BASE + triggerDeviceId.toString(),
      {
        params,
      }
    );
  }
}
