/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface Binary {
  mime_type?: string;
  data?: string;
}

export interface ContentPart {
  type?: string;
  text?: string;
  image_url?: ImageURL;
  binary?: Binary;
}

export interface Function {
  name?: string;
  description?: string;
  parameters?: string;
}

export interface FunctionCall {
  name?: string;
  arguments?: string;
}

export interface ImageURL {
  url?: string;
}

export interface Message {
  role?: string;
  content?: string;
  tool_calls?: Array<ToolCall>;
  tool_call_id?: string;
  /** 消息内容分片 */
  parts?: Array<ContentPart>;
}

export interface ModelConfig {
  temperature?: number;
  max_tokens?: number;
  top_k?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  json_mode?: boolean;
}

export interface MPullPromptQuery {
  space_id?: Int64;
  prompt_key?: string;
  version?: string;
}

export interface Prompt {
  /** 空间ID */
  space_id?: Int64;
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
  model_config?: ModelConfig;
}

export interface PromptResult {
  query?: MPullPromptQuery;
  prompt?: Prompt;
}

export interface PromptTemplate {
  /** 模板类型 */
  template_type?: string;
  /** 只支持message list形式托管 */
  message_list?: Array<Message>;
  /** 变量定义 */
  variable_defs?: Array<VariableDef>;
}

export interface SaaSMPullPromptRequest {
  queries?: Array<MPullPromptQuery>;
  base?: base.Base;
}

export interface SaaSMPullPromptResponse {
  results?: Array<PromptResult>;
  base_resp?: base.BaseResp;
}

export interface Tool {
  type?: string;
  function?: Function;
}

export interface ToolCall {
  id?: string;
  type?: string;
  function_call?: FunctionCall;
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
