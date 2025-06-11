/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum EntityType {
  Project = 1,
  Bot = 2,
}

export enum EventConnectorPublishResult {
  /** 审核中 */
  Auditing = 1,
  /** 成功 */
  Success = 2,
  /** 失败 */
  Failed = 3,
}

export enum EventType {
  Create = 1,
  Update = 2,
  Delete = 3,
  Publish = 4,
}
/* eslint-enable */
