import { Component, OnDestroy, OnInit } from '@angular/core';
import { TriggerDeviceResolver } from '../resolvers/trigger-device.resolver';
import { Language } from 'angular-l10n';
import {
  ITriggerDevice,
  ITriggerDeviceChange,
  TriggerDeviceStatus,
  triggerDeviceStatusNames,
} from '../../shared/models/trigger-device.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TriggerDevicesService } from '../services/trigger-devices.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TitleService } from '../../title.service';
import { Location } from '@angular/common';
import { bindPhysicalAddressUnmask, physicalAddressMask, physicalAddressPattern } from '../../shared/utils';
import { triggerDeviceChanged } from '../validators/trigger-device-changed';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { getCommonErrorMessage, ServerErrorCode } from '../../shared/http/server-error-utils';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit, OnDestroy {
  static readonly createRoute = 'create';
  static readonly updateRoute = `:${TriggerDeviceResolver.paramName}/edit`;

  @Language() lang: string;
  isMakingRequest: boolean;
  triggerDevice?: ITriggerDevice;
  form!: FormGroup;
  physicalAddressMask: ReadonlyArray<string | RegExp>;
  triggerDeviceStatus = TriggerDeviceStatus;
  triggerDeviceStatusNames = triggerDeviceStatusNames;
  protected _langChanged$!: Subscription;
  protected _macUnmask$!: Subscription;
  protected _triggerDevices: TriggerDevicesService;
  protected _fb: FormBuilder;
  protected _route: ActivatedRoute;
  protected _snackBar: MatSnackBar;
  protected _l10n: L10nService;
  protected _title: TitleService;
  protected _location: Location;
  protected _snackBarWithError: boolean;

  get controls() {
    return this.form.controls;
  }

  constructor(
    triggerDevices: TriggerDevicesService,
    formBuilder: FormBuilder,
    route: ActivatedRoute,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
    location: Location,
  ) {
    this._triggerDevices = triggerDevices;
    this._fb = formBuilder;
    this._route = route;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this._title = title;
    this._location = location;

    this.lang = this._l10n.locale.getCurrentLanguage();
    this._snackBarWithError = false;
    this.isMakingRequest = false;
    this.physicalAddressMask = physicalAddressMask;
  }

  static getUpdateRoute(triggerDeviceId: number) {
    return [triggerDeviceId, 'edit'];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.triggerDevice = this._route.snapshot.data[TriggerDeviceResolver.propName];
    if (!this.triggerDevice) {
      this._title.setWrappedLocalizedTitle('titles.trigger-devices.create');
      this.form = this._fb.group({
        physicalAddress: ['', [Validators.required, Validators.pattern(physicalAddressPattern)]],
        status: ['', [Validators.required]],
        name: ['', [Validators.required]],
        type: ['', [Validators.required]],
      });
    } else {
      this._title.setWrappedLocalizedTitle('titles.trigger-devices.update');
      this.form = this._fb.group({
        physicalAddress: [this.triggerDevice.physicalAddress, [Validators.required, Validators.pattern(physicalAddressPattern)]],
        status: [this.triggerDevice.status, [Validators.required]],
        name: [this.triggerDevice.name, [Validators.required]],
        type: [this.triggerDevice.type, [Validators.required]],
      }, { validators: [triggerDeviceChanged(this.triggerDevice)] });
    }
    this._macUnmask$ = bindPhysicalAddressUnmask(this.controls.physicalAddress);
  }

  ngOnDestroy() {
    this._langChanged$.unsubscribe();
    this._macUnmask$.unsubscribe();
    if (this._snackBarWithError) {
      this._snackBar.dismiss();
    }
  }

  create() {
    const newTriggerDevice = this.getTriggerDeviceFromForm() as ITriggerDeviceChange;
    this._triggerDevices.createTriggerDevice(newTriggerDevice).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['trigger-device.create.done', 'dialog.ok']);
        this._snackBar.open(translations['trigger-device.create.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        let msg = '';
        if (err instanceof HttpErrorResponse) {
          switch (err.error.code as string) {
            case ServerErrorCode.TRIGGER_DEVICE_MAC_DUPLICATE:
              msg = 'trigger-device.errors.physical-address-dup';
              break;
            case ServerErrorCode.TRIGGER_DEVICE_NAME_DUPLICATE:
              msg = 'trigger-device.errors.name-dup';
              break;
            default:
              msg = getCommonErrorMessage(err);
          }
        }
        if (!msg) {
          msg = 'errors.unknown';
        }
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
        this._snackBarWithError = true;
      }
    );
    this.isMakingRequest = true;
    this.form.disable({onlySelf: false, emitEvent: true});
  }

  update() {
    const changedTriggerDevice = this.getTriggerDeviceFromForm();
    this._triggerDevices.updateTriggerDevice(this.triggerDevice!.triggerDeviceId, changedTriggerDevice).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['trigger-device.update.done', 'dialog.ok']);
        this._snackBar.open(translations['trigger-device.update.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        let msg = '';
        if (err instanceof HttpErrorResponse) {
          switch (err.error.code as string) {
            case ServerErrorCode.TRIGGER_DEVICE_MAC_DUPLICATE:
              msg = 'trigger-device.errors.physical-address-dup';
              break;
            case ServerErrorCode.TRIGGER_DEVICE_NAME_DUPLICATE:
              msg = 'trigger-device.errors.name-dup';
              break;
            case ServerErrorCode.NOT_FOUND:
              msg = 'trigger-device.errors.not-found';
              break;
            default:
              msg = getCommonErrorMessage(err);
          }
        }
        if (!msg) {
          msg = 'errors.unknown';
        }
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
        this._snackBarWithError = true;
      },
    );
    this.isMakingRequest = true;
    this.form.disable({onlySelf: false, emitEvent: true});
  }

  goBack() {
    this._location.back();
  }

  protected getTriggerDeviceFromForm(): Partial<ITriggerDevice> | ITriggerDevice {
    if (!this.triggerDevice) {
      return {
        physicalAddress: this.controls.physicalAddress.value,
        status: this.controls.status.value,
        name: this.controls.name.value,
        type: this.controls.type.value,
      };
    }
    const triggerDeviceChange = {} as Partial<ITriggerDevice>;
    if (this.triggerDevice.physicalAddress !== this.controls.physicalAddress.value) {
      triggerDeviceChange.physicalAddress = this.controls.physicalAddress.value;
    }
    if (this.triggerDevice.status !== this.controls.status.value) {
      triggerDeviceChange.status = this.controls.status.value;
    }
    if (this.triggerDevice.name !== this.controls.name.value) {
      triggerDeviceChange.name = this.controls.name.value;
    }
    if (this.triggerDevice.type !== this.controls.type.value) {
      triggerDeviceChange.type = this.controls.type.value;
    }
    return triggerDeviceChange;
  }
}
