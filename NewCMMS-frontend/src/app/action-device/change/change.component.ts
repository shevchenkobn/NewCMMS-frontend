import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionDeviceResolver } from '../resolvers/action-device.resolver';
import { Language } from 'angular-l10n';
import { ActionDeviceStatus, actionDeviceStatusNames, IActionDevice, IActionDeviceChange } from '../../shared/models/action-device.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TitleService } from '../../title.service';
import { Location } from '@angular/common';
import { ActionDevicesService } from '../services/action-devices.service';
import { actionDeviceChanged } from '../validators/action-device-changed';
import { finalize } from 'rxjs/operators';
import { getCommonErrorMessage, getUserUpdateOrCreateErrorMessage, ServerErrorCode } from '../../shared/http/server-error-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { bindPhysicalAddressUnmask, hexSymbolRegex, physicalAddressMask, physicalAddressPattern } from '../../shared/utils';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit, OnDestroy {
  static readonly createRoute = 'create';
  static readonly updateRoute = `:${ActionDeviceResolver.paramName}/edit`;

  @Language() lang: string;
  isMakingRequest: boolean;
  actionDevice?: IActionDevice;
  form!: FormGroup;
  physicalAddressMask: ReadonlyArray<string | RegExp>;
  actionDeviceStatus = ActionDeviceStatus;
  actionDeviceStatusNames = actionDeviceStatusNames;
  protected _langChanged$!: Subscription;
  protected _macUnmask$!: Subscription;
  protected _actionDevices: ActionDevicesService;
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
    actionDevices: ActionDevicesService,
    formBuilder: FormBuilder,
    route: ActivatedRoute,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
    location: Location,
  ) {
    this._actionDevices = actionDevices;
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

  static getUpdateRoute(actionDeviceId: number) {
    return [actionDeviceId, 'edit'];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.actionDevice = this._route.snapshot.data[ActionDeviceResolver.propName];
    if (!this.actionDevice) {
      this._title.setWrappedLocalizedTitle('titles.action-devices.create');
      this.form = this._fb.group({
        physicalAddress: ['', [Validators.required, Validators.pattern(physicalAddressPattern)]], // FIXME: add regexp
        status: ['', [Validators.required]],
        name: ['', [Validators.required]],
        type: ['', [Validators.required]],
        hourlyRate: ['', [Validators.required, Validators.pattern(/^(\d{1,7}|\d{0,7}\.\d{1,7})$/)]],
      });
    } else {
      this._title.setWrappedLocalizedTitle('titles.action-devices.update');
      this.form = this._fb.group({
        physicalAddress: [this.actionDevice.physicalAddress, [Validators.required, Validators.pattern(physicalAddressPattern)]],
        status: [this.actionDevice.status, [Validators.required]],
        name: [this.actionDevice.name, [Validators.required]],
        type: [this.actionDevice.type, [Validators.required]],
        hourlyRate: [this.actionDevice.hourlyRate, [Validators.required, Validators.pattern(/^(\d{1,7}|\d{0,7}\.\d{1,6})$/)]],
      }, { validators: [actionDeviceChanged(this.actionDevice)] });
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
    const newActionDevice = this.getActionDeviceFromForm() as IActionDeviceChange;
    this._actionDevices.createActionDevice(newActionDevice).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['action-device.create.done', 'dialog.ok']);
        this._snackBar.open(translations['action-device.create.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        let msg = '';
        if (err instanceof HttpErrorResponse) {
          switch (err.error.code as string) {
            case ServerErrorCode.ACTION_DEVICE_MAC_DUPLICATE:
              msg = 'action-device.errors.physical-address-dup';
              break;
            case ServerErrorCode.ACTION_DEVICE_NAME_DUPLICATE:
              msg = 'action-device.errors.name-dup';
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
    const changedActionDevice = this.getActionDeviceFromForm();
    this._actionDevices.updateActionDevice(this.actionDevice!.actionDeviceId, changedActionDevice).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['action-device.update.done', 'dialog.ok']);
        this._snackBar.open(translations['action-device.update.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        let msg = '';
        if (err instanceof HttpErrorResponse) {
          switch (err.error.code as string) {
            case ServerErrorCode.ACTION_DEVICE_MAC_DUPLICATE:
              msg = 'action-device.errors.physical-address-dup';
              break;
            case ServerErrorCode.ACTION_DEVICE_NAME_DUPLICATE:
              msg = 'action-device.errors.name-dup';
              break;
            case ServerErrorCode.NOT_FOUND:
              msg = 'action-device.errors.not-found';
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

  protected getActionDeviceFromForm(): Partial<IActionDevice> | IActionDevice {
    if (!this.actionDevice) {
      return {
        physicalAddress: this.controls.physicalAddress.value,
        status: this.controls.status.value,
        name: this.controls.name.value,
        type: this.controls.type.value,
        hourlyRate: this.controls.hourlyRate.value,
      };
    }
    const actionDeviceChange = {} as Partial<IActionDeviceChange>;
    if (this.actionDevice.physicalAddress !== this.controls.physicalAddress.value) {
      actionDeviceChange.physicalAddress = this.controls.physicalAddress.value;
    }
    if (this.actionDevice.status !== this.controls.status.value) {
      actionDeviceChange.status = this.controls.status.value;
    }
    if (this.actionDevice.name !== this.controls.name.value) {
      actionDeviceChange.name = this.controls.name.value;
    }
    if (this.actionDevice.type !== this.controls.type.value) {
      actionDeviceChange.type = this.controls.type.value;
    }
    if (this.actionDevice.hourlyRate !== this.controls.hourlyRate.value) {
      actionDeviceChange.hourlyRate = this.controls.hourlyRate.value;
    }
    return actionDeviceChange;
  }
}
