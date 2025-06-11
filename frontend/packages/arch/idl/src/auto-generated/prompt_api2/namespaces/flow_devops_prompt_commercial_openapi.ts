/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface Function {
  name?: string;
  description?: string;
  parameters?: string;
}

export interface LLMConfig {
  temperature?: number;
  max_tokens?: number;
  top_k?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  json_mode?: boolean;
}

export interface Message {
  role?: string;
  content?: string;
}

export interface MPullPromptRequest {
  workspace_id?: Int64;
  queries?: Array<PromptQuery>;
  base?: base.Base;
}

export interface MPullPromptResponse {
  code?: number;
  msg?: string;
  data?: PromptResultData;
  base_resp?: base.BaseResp;
}

export interface Prompt {
  /** 空间ID */
  workspace_id?: Int64;
  /** 唯一标识 */
  prompt_key?: string;
  /** 版本 */
  version?: string;
  /** Prompt模板 */
  prompt_template?: PromptTemplate;
  /** tool定义 */
  tools?: Array<Tool>;
  /** tool调用配置 */
  tool_call_config?: ToolCallConfig;
  /** 模型配置 */
  llm_config?: LLMConfig;
}

export interface PromptQuery {
  prompt_key?: string;
  version?: string;
}

export interface PromptResult {
  query?: PromptQuery;
  prompt?: Prompt;
}

export interface PromptResultData {
  items?: Array<PromptResult>;
}

export interface PromptTemplate {
  /** 模板类型 */
  template_type?: string;
  /** 只支持message list形式托管 */
  messages?: Array<Message>;
  /** 变量定义 */
  variable_defs?: Array<VariableDef>;
}

export interface Tool {
  type?: string;
  function?: Function;
}

export interface ToolCallConfig {
  tool_choice?: string;
}

export interface VariableDef {
  /** 变量名字 */
  key?: string;
  /** 变量描述 */
  desc?: string;
  /** 变量类型 */
  type?: string;
}
/* eslint-enable */
