/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** *
和前端交互的视图结构体 */
export enum IntelligenceStatus {
  Using = 1,
  Deleted = 2,
  Banned = 3,
  /** 迁移失败 */
  MoveFailed = 4,
  /** 复制中 */
  Copying = 5,
  /** 复制失败 */
  CopyFailed = 6,
}

export enum IntelligenceType {
  Bot = 1,
  Project = 2,
  DouyinAvatarBot = 3,
}

export interface IntelligenceBasicInfo {
  id?: string;
  name?: string;
  description?: string;
  icon_uri?: string;
  icon_url?: string;
  space_id?: string;
  owner_id?: string;
  create_time?: string;
  update_time?: string;
  status?: IntelligenceStatus;
  publish_time?: string;
  enterprise_id?: string;
  organization_id?: Int64;
}
/* eslint-enable */
