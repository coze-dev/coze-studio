/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum MessageBizType {
  Workflow = 1,
  Plugin = 2,
  Dataset = 3,
  Database = 4,
}

export enum MessageOperateType {
  Create = 1,
  /** 内容修改 */
  Update = 2,
  /** 元数据修改 */
  MetaUpdate = 3,
  Delete = 4,
  Publish = 5,
  /** 回滚操作 */
  Rollback = 6,
}
/* eslint-enable */
