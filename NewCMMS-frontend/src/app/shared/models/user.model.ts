export enum UserRoles {
  EMPLOYEE = 0x1,
  ADMIN = 0x2,
}

export const minRole = 1;
export const maxRole = 2;

export const userRoleNames = Object.keys(UserRoles).filter(
  r => Number.isNaN(Number.parseInt(r, 10))
);

export interface IUserChange {
  email: string;
  role: UserRoles;
  fullName: string;
  password: string;
}

export interface IUser {
  userId: number;
  email: string;
  role: UserRoles;
  fullName: string;
}

export interface IPasswordUser extends IUser {
  password?: string;
}

export const superUserId = 1;

export function userRoleToObject(user?: Readonly<IUser>) {
  if (!user || !user.role) {
    return userRoleNames.reduce((obj, roleName) => {
      obj[roleName] = false;
      return obj;
    }, {} as Record<string, boolean>);
  }
  const roles = {} as {[role: string]: boolean};
  for (let i = 1; i <= maxRole; i <<= 1) {
    roles[UserRoles[i]] = !!(user.role & i);
  }
  return roles;
}

export function updateRoleObjectForUser(obj: Record<string, boolean>, user: Readonly<IUser>) {
  for (let i = minRole; i <= maxRole; i <<= 1) {
    obj[UserRoles[i]] = !!(user.role & i);
  }
  return obj;
}

export function userRoleFromObject(obj: {[role: string]: boolean}) {
  let role = 0 as UserRoles;
  for (let i = minRole; i <= maxRole; i <<= 1) {
    if (obj[UserRoles[i]]) {
      role |= i;
    }
  }
  return role;
}
