import {Nullable} from '../../@types';

export interface IBillRate {
  actionDeviceId: Nullable<number>;
  hourlyRate: string;
  billId: number;
}
