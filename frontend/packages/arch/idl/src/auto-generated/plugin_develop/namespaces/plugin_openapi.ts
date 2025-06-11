/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as plugin_develop_common from './plugin_develop_common';

export type Int64 = string | number;

export interface GetOAuthPluginListData {
  items?: Array<OpenAPIOAuthPluginInfo>;
}

export interface OpenAPIGetOAuthPluginListRequest {
  entity_id?: string;
  /** '授权上下文, 0-agent, 1-app, 2-workflow' */
  entity_type?: string;
  connector_id?: string;
  /** connector_uid */
  user_id?: string;
  Base?: base.Base;
}

export interface OpenAPIGetOAuthPluginListResponse {
  data?: GetOAuthPluginListData;
  /** 调用结果 */
  code: Int64;
  /** 成功为success, 失败为简单的错误信息 */
  msg?: string;
  BaseResp: base.BaseResp;
}

export interface OpenAPIOAuthPluginInfo {
  plugin_id?: string;
  /** 用户授权状态 */
  status?: plugin_develop_common.OAuthStatus;
  /** 插件name */
  plugin_name?: string;
  /** 插件头像 */
  plugin_icon?: string;
}

export interface OpenAPIRevokeAuthTokenRequest {
  /** 如果为空，该实体下的plugin全部取消授权 */
  plugin_id?: string;
  entity_id?: string;
  /** '授权上下文, 0-agent, 1-app, 2-workflow' */
  entity_type?: string;
  connector_id?: string;
  /** connector_uid */
  user_id?: string;
  Base?: base.Base;
}

export interface OpenAPIRevokeAuthTokenResponse {
  /** 调用结果 */
  code: Int64;
  /** 成功为success, 失败为简单的错误信息 */
  msg?: string;
  BaseResp: base.BaseResp;
}
/* eslint-enable */
