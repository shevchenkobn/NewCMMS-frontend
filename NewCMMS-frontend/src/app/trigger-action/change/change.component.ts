import { Component, OnDestroy, OnInit } from '@angular/core';
import { TriggerActionResolver } from '../resolvers/trigger-action.resolver';
import { Language } from 'angular-l10n';
import { ITriggerAction } from '../../shared/models/trigger-action.model';
import { FormGroup } from '@angular/forms';
import { ITriggerDevice } from '../../shared/models/trigger-device.model';
import { IActionDevice } from '../../shared/models/action-device.model';

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
  actionDevices!: IActionDevice[];
  form!: FormGroup;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
