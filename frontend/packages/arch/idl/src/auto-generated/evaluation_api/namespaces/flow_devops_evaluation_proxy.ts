/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_evaluation_entity from './flow_devops_evaluation_entity';
import * as base from './base';

export type Int64 = string | number;

export interface AgentExecuteMeta {
  from_region?: string;
  callee?: string;
  cluster?: string;
  timeout?: Int64;
  method?: string;
}

export interface AgentExecuteProxyContent {
  agent_execute_meta?: AgentExecuteMeta;
  call_type?: flow_devops_evaluation_entity.CallbackType;
  /** use base64 encode and decode */
  payload?: string;
}

export interface AgentExecuteProxyReq {
  agent_execute_proxy_content?: AgentExecuteProxyContent;
  extra?: Record<string, string>;
  Base?: base.Base;
}

export interface AgentExecuteProxyRes {
  result_payload?: string;
  occour_error?: boolean;
  error_message?: string;
}

export interface AgentExecuteProxyResp {
  agent_execute_proxy_result?: AgentExecuteProxyRes;
  extra?: Record<string, string>;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
