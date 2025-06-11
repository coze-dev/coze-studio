/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** BotSnapshotVersion 评测的快照Bot */
export interface BotSnapshotVersion {
  /** 空间ID */
  space_id?: string;
  /** BotID */
  bot_id?: string;
  /** 用于展示的语义化快照version */
  snap_version?: string;
  /** 版本创建时间 */
  create_time_ms?: string;
  /** 对应的commmit版本 */
  commit_version?: string;
}
/* eslint-enable */
