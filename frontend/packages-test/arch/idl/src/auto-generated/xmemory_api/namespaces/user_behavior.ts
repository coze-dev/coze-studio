/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** to be extended */
export enum UserAction {
  /** showing specfic object */
  Show = 1,
  /** showing specfic object */
  Click = 2,
  /** browsing specfic object, not used for now */
  Browse = 3,
  /** user define his/her own setting */
  UserSetting = 4,
  /** routing from one object to another */
  Route = 5,
}
/* eslint-enable */
