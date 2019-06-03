import { Component, OnDestroy, OnInit } from '@angular/core';
import { TriggerActionResolver } from '../resolvers/trigger-action.resolver';
import { Language } from 'angular-l10n';
import { ITriggerAction, ITriggerActionChange } from '../../shared/models/trigger-action.model';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { IActionDevice } from '../../shared/models/action-device.model';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { L10nService } from '../../shared/services/l10n.service';
import { TitleService } from '../../title.service';
import { Location } from '@angular/common';
import { TriggerActionsService } from '../services/trigger-actions.service';
import { physicalAddressPattern } from '../../shared/utils';
import { triggerDeviceChanged } from '../../trigger-device/validators/trigger-device-changed';
import { finalize, map, startWith } from 'rxjs/operators';
import { getCommonErrorMessage } from '../../shared/http/server-error-utils';
import { TriggerDevicesResolver } from '../../trigger-device/resolvers/trigger-devices.resolver';
import { ActionDevicesResolver } from '../../action-device/resolvers/action-devices.resolver';
import { triggerActionChanged } from '../validators/trigger-action-changed';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit, OnDestroy {
  static readonly createRoute = 'create';
  static readonly updateRoute = `:${TriggerActionResolver.paramName}/edit`;

  @Language() lang: string;
  isMakingRequest: boolean;
  triggerAction?: ITriggerAction;
  triggerDevices!: ITriggerDevice[];
  triggerDeviceAutocompleteList$!: Observable<ITriggerDevice[]>;
  actionDevices!: IActionDevice[];
  actionDeviceAutocompleteList$!: Observable<IActionDevice[]>;
  form!: FormGroup;
  protected _langChanged$!: Subscription;
  // protected _triggerDeviceAutocomplete$!: Subscription;
  // protected _actionDeviceAutocomplete$!: Subscription;
  protected _triggerActions: TriggerActionsService;
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
    triggerActions: TriggerActionsService,
    formBuilder: FormBuilder,
    route: ActivatedRoute,
    snackBar: MatSnackBar,
    l10n: L10nService,
    title: TitleService,
    location: Location,
  ) {
    this._triggerActions = triggerActions;
    this._fb = formBuilder;
    this._route = route;
    this._snackBar = snackBar;
    this._l10n = l10n;
    this._title = title;
    this._location = location;

    this.lang = this._l10n.locale.getCurrentLanguage();
    this._snackBarWithError = false;
    this.isMakingRequest = false;
  }

  static getUpdateRoute(triggerActionId: number) {
    return [triggerActionId, 'edit'];
  }

  ngOnInit() {
    this._langChanged$ = this._l10n.languageCodeChangedLoadFinished.subscribe(lang => this.lang = lang);
    this.triggerAction = this._route.snapshot.data[TriggerActionResolver.propName];
    this.triggerDevices = this._route.snapshot.data[TriggerDevicesResolver.propName];
    this.actionDevices = this._route.snapshot.data[ActionDevicesResolver.propName];
    if (!this.triggerAction) {
      this._title.setWrappedLocalizedTitle('titles.trigger-actions.create');
      this.form = this._fb.group({
        triggerDevice: [null, [Validators.required]],
        actionDevice: [null, [Validators.required]],
      });
    } else {
      this._title.setWrappedLocalizedTitle('titles.trigger-actions.update');
      const triggerDevice = this.triggerDevices.find(d => d.triggerDeviceId === this.triggerAction!.triggerDeviceId)!;
      const actionDevice = this.actionDevices.find(d => d.actionDeviceId === this.triggerAction!.actionDeviceId)!;
      this.form = this._fb.group({
        triggerDevice: [triggerDevice, [Validators.required]],
        actionDevice: [actionDevice, [Validators.required]],
      }, { validators: [triggerActionChanged(this.triggerAction, triggerDevice, actionDevice)] });
    }
    this.triggerDeviceAutocompleteList$ = this.applyFilterToList(this.controls.triggerDevice, this.triggerDevices);
    this.actionDeviceAutocompleteList$ = this.applyFilterToList(this.controls.actionDevice, this.actionDevices);
  }

  ngOnDestroy() {
    this._langChanged$.unsubscribe();
    if (this._snackBarWithError) {
      this._snackBar.dismiss();
    }
  }

  create() {
    const newTriggerAction = this.getTriggerActionFromForm() as ITriggerActionChange;
    this._triggerActions.createTriggerAction(newTriggerAction).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['trigger-action.create.done', 'dialog.ok']);
        this._snackBar.open(translations['trigger-action.create.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        const msg = getCommonErrorMessage(err) || 'errors.unknown';
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate([msg, 'dialog.ok']);
        this._snackBar.open(translations[msg], translations['dialog.ok']);
        this._snackBarWithError = true;
      },
    );
    this.isMakingRequest = true;
    this.form.disable({onlySelf: false, emitEvent: true});
  }

  update() {
    const changedTriggerAction = this.getTriggerActionFromForm();
    this._triggerActions.updateTriggerAction(this.triggerAction!.triggerActionId, changedTriggerAction).pipe(
      finalize(() => {
        this.isMakingRequest = false;
        this.form.enable({onlySelf: false, emitEvent: true});
      }),
    ).subscribe(
      () => {
        this._snackBar.dismiss();
        const translations = this._l10n.translate.translate(['trigger-action.update.done', 'dialog.ok']);
        this._snackBar.open(translations['trigger-action.update.done'], translations['dialog.ok']);
        this._snackBarWithError = false;
        this.goBack();
      },
      err => {
        const msg = getCommonErrorMessage(err) || 'errors.unknown';
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

  protected applyFilterToList<T extends { name: string }>(control: AbstractControl, devices: T[]) {
    return control.valueChanges.pipe(
      // startWith(''),
      map(value => {
        return typeof value === 'string' ? value : value.name;
      }),
      map(name => {
        const values = name ? this.filterDeviceList(devices, name) : devices.slice();
        if (!values.some(d => d.name === name)) {
          if (control.errors) {
            control.errors.select = true;
          } else {
            control.setErrors({ select: true });
          }
        } else {
          if (control.errors) {
            delete control.errors.select;
          }
        }
        return values;
      }),
    );
  }

  protected filterDeviceList<T extends { name: string }>(devices: T[], namePart: string) {
    const searchTerm = namePart.toLowerCase();
    return devices.filter(d => d.name.toLowerCase().includes(searchTerm));
  }

  protected getTriggerActionFromForm(): Partial<ITriggerActionChange> | ITriggerActionChange {
    if (!this.triggerAction) {
      return {
        triggerDeviceId: this.getTriggerDevice(this.controls.triggerDevice.value).triggerDeviceId,
        actionDeviceId: this.getActionDevice(this.controls.actionDevice.value).actionDeviceId,
      };
    }
    const triggerActionChange = {} as Partial<ITriggerActionChange>;
    if (this.triggerAction.triggerDeviceId !== this.controls.triggerDevice.value.name) {
      triggerActionChange.triggerDeviceId = this.getTriggerDevice(this.controls.triggerDevice.value).triggerDeviceId;
    }
    if (this.triggerAction.actionDeviceId !== this.controls.actionDevice.value.name) {
      triggerActionChange.actionDeviceId = this.getActionDevice(this.controls.actionDevice.value).actionDeviceId;
    }

    return triggerActionChange;
  }

  protected getTriggerDevice(formValue: any): ITriggerDevice {
    return typeof formValue === 'string'
      ? this.triggerDevices.find(d => d.name === formValue)
      : formValue;
  }

  protected getActionDevice(formValue: any): IActionDevice {
    return typeof formValue === 'string'
      ? this.actionDevices.find(d => d.name === formValue)
      : formValue;
  }

  protected displayDeviceName<T extends { name: string }>(device?: T) {
    return device ? device.name : undefined;
  }

  // protected ensureObjectValue(control: AbstractControl) {
  //   if (typeof control.value === 'object') {
  //     control.setValue(null);
  //   }
  // }
}
