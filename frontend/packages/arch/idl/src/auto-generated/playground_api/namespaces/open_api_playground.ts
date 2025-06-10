/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface OpenSpace {
  /** 空间 id */
  id?: string;
  /** 空间名称 */
  name?: string;
  /** 空间图标 url */
  icon_url?: string;
  /** 当前用户角色, 枚举值: owner, admin, member */
  role_type?: string;
  /** 工作空间类型, 枚举值: personal, team */
  workspace_type?: string;
}

export interface OpenSpaceData {
  workspaces?: Array<OpenSpace>;
  /** 空间总数 */
  total_count?: Int64;
}

/** *  plagyground 开放api idl文件
 * */
export interface OpenSpaceListRequest {
  page_num?: Int64;
  page_size?: Int64;
}

export interface OpenSpaceListResponse {
  data?: OpenSpaceData;
  code: Int64;
  msg: string;
}
/* eslint-enable */
