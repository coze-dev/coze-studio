/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 空间类型 */
export enum SpaceType {
  Undefined = 0,
  Personal = 1,
  Team = 2,
  /** 官方空间 */
  Official = 3,
}

export interface SpaceInfo {
  /** 空间id */
  id: Int64;
  /** 空间accessKey */
  accessKey?: string;
  /** 空间secretKey */
  secretKey?: string;
  /** 空间类型 */
  spaceType?: SpaceType;
}
/* eslint-enable */
