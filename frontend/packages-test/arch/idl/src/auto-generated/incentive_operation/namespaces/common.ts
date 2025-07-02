/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum GroupStatus {
  Enable = 1,
  Disable = 2,
}

export enum GroupType {
  Normal = 1,
  Continue = 2,
}

export enum PeriodType {
  None = 1,
  Day = 2,
  Week = 3,
  Month = 4,
}

export enum ReceiveType {
  Auto = 1,
  Manual = 2,
}

export enum RewardType {
  Token = 1,
  Coin = 2,
}

export enum TaskStatus {
  Enable = 1,
  Disable = 2,
}

export enum UserControl {
  Disable = 0,
  BlackList = 1,
  WhiteList = 2,
}

export interface Reward {
  type: RewardType;
  amount: Int64;
  receive_type?: ReceiveType;
}

export interface UserTaskButton {
  linked?: string;
  desc?: string;
}
/* eslint-enable */
