export enum TriggerDeviceStatus {
  CONNECTED = 1,
  DISCONNECTED = 2,
}

export const minStatus = 1;
export const maxStatus = 2;

export interface ITriggerDeviceChange {
  physicalAddress: string;
  status: TriggerDeviceStatus;
  name: string;
  type: string;
}

export interface ITriggerDevice extends ITriggerDeviceChange {
  triggerDeviceId: number;
}

export const triggerDeviceStatusNames = Object.keys(TriggerDeviceStatus).filter(
  s => Number.isNaN(Number.parseInt(s, 10))
);
