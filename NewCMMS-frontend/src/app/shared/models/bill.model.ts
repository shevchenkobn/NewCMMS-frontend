import { Nullable } from '../../@types';

export interface IBill {
  triggerDeviceId: number;
  startedAt: Date;
  finishedAt: Nullable<Date>;
  sum: Nullable<string>;
  billId: number;
}
