export enum UserTriggerType {
  UNSPECIFIED = 0,
  ENTER = 1,
  LEAVE = 2,
}

export interface IUserTrigger {
  userTriggerId: number;
  userId: number;
  triggerDeviceId: number;
  triggerType: UserTriggerType;
  triggerTime: Date;
}

// export const userTriggerTypeNames = Object.keys(UserTriggerType).filter(
//   t => Number.isNaN(Number.parseInt(t, 10))
// );
