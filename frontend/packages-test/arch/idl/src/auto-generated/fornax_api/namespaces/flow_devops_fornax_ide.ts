/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as ide from './ide';
import * as model from './model';

export type Int64 = string | number;

export enum IDELaunchSourceType {
  Agent = 0,
  CustomComponent = 1,
}

export interface BindCloudIDESpaceReq {
  workspaceID: string;
  agentID?: Int64;
  Base?: base.Base;
}

export interface BindCloudIDESpaceResp {
  BaseResp?: base.BaseResp;
}

export interface CheckCloudIDESpaceReq {
  workspaceID?: string;
  Base?: base.Base;
}

export interface CheckCloudIDESpaceResp {
  /** cloud ide workspace 是否存在 (90d 回收) */
  exist?: boolean;
  BaseResp?: base.BaseResp;
}

export interface FetchSpacesReq {
  'X-Jwt-Token': string;
  Base?: base.Base;
}

export interface FetchSpacesResp {
  spaces?: Array<ide.SpaceInfo>;
  BaseResp?: base.BaseResp;
}

export interface GetCloudIDESpaceReq {
  agentID?: Int64;
  Base?: base.Base;
}

export interface GetCloudIDESpaceResp {
  workspaceID?: string;
  BaseResp?: base.BaseResp;
}

export interface IDELaunchReq {
  'X-Jwt-Token': string;
  /** 从团队空间创建需要携带agentID，从个人空间创建还没有agentid就不需要传 */
  agentID?: Int64;
  repoName?: string;
  branch?: string;
  agentName?: string;
  sourceType?: IDELaunchSourceType;
}

export interface IDELaunchResp {
  location: string;
  alreadyLaunched?: boolean;
  hasAuth?: boolean;
}

export interface JWTLoginReq {
  'X-Jwt-Token': string;
  session_id?: string;
  Base?: base.Base;
}

export interface JWTLoginResp {
  sessionID: string;
}

export interface OApiListCommonModelInfoReq {
  modelName: string;
  Authorization: string;
}

export interface OApiListCommonModelInfoResp {
  model?: model.Model;
  auth?: model.Authorization;
}

export interface UnbindCloudIDESpaceReq {
  ssoUserName: string;
  agentID?: Int64;
  Base?: base.Base;
}

export interface UnbindCloudIDESpaceResp {
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
