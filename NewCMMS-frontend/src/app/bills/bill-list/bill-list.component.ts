import { Component, OnInit } from '@angular/core';
import {Language} from 'angular-l10n';
import {ITriggerDevice} from '../../shared/models/trigger-device.model';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.scss']
})
export class BillListComponent implements OnInit {
  static readonly route = '';
  @Language() lang: string;
  isMakingRequest: boolean;
  triggerDevices!: Map<number, ITriggerDevice>;

  constructor() { }

  ngOnInit() {
  }

}
