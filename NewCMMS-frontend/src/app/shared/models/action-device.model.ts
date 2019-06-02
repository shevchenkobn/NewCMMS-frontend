export enum ActionDeviceStatus {
  CONNECTED = 1,
  ONLINE = 2,
  DISCONNECTED = 3,
}

export const minStatus = 1;
export const maxStatus = 3;

export interface IActionDeviceChange {
  physicalAddress: string;
  status: ActionDeviceStatus;
  name: string;
  type: string;
  hourlyRate: string;
}

export interface IActionDevice extends IActionDeviceChange {
  actionDeviceId: number;
}

export const actionDeviceStatusNames = Object.keys(ActionDeviceStatus).filter(
  s => Number.isNaN(Number.parseInt(s, 10))
);
