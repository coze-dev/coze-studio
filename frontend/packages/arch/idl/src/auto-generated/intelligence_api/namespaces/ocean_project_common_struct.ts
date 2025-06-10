/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum OceanProjectStatus {
  Using = 1,
  Deleted = 2,
}

/** *
和前端交互的视图结构体 */
export interface OceanProjectBasicInfo {
  id?: string;
  name?: string;
  description?: string;
  icon_uri?: string;
  icon_url?: string;
  space_id?: string;
  owner_id?: string;
  create_time?: string;
  update_time?: string;
  status?: OceanProjectStatus;
}
/* eslint-enable */
