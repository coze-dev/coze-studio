/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export enum ContentType {
  Text = 1,
  Image = 2,
  Binary = 3,
}

export enum MessageType {
  System = 1,
  User = 2,
  Assistant = 3,
  Tool = 4,
  Placeholder = 20,
}

export enum ToolType {
  Function = 1,
}

export enum VariableType {
  Undefined = 0,
  String = 1,
  /** 废弃，使用Number 不分区整数和浮点数 */
  Integer = 2,
  Boolean = 3,
  Number = 4,
  Array = 5,
  Object = 6,
  Placeholder = 7,
}

export interface BinaryContent {
  mime_type?: string;
  data?: Blob;
}

export interface ContentPart {
  type?: ContentType;
  /** 文本内容 */
  text?: string;
  /** 图片URL */
  image?: Image;
  /** 二进制内容 */
  binary_content?: BinaryContent;
  /** 配置 */
  config?: ContentPartConfig;
}

export interface ContentPartConfig {
  image_resolution?: string;
}

export interface FunctionCall {
  name?: string;
  arguments?: string;
}

export interface Image {
  url?: string;
}

/** Message */
export interface Message {
  id?: Int64;
  message_type?: MessageType;
  content?: string;
  tool_calls?: Array<ToolCall>;
  tool_call_id?: string;
  /** 多模态消息内容分片 */
  parts?: Array<ContentPart>;
  metadata?: Record<string, string>;
}

export interface PromptTemplate {
  template_type?: string;
  message_list?: Array<Message>;
  /** 变量定义 */
  variable_defs?: Array<VariableDef>;
  metadata?: Record<string, string>;
}

export interface RenderPromptTemplateRequest {
  prompt_template?: PromptTemplate;
  /** 变量值 */
  variable_vals?: Array<VariableVal>;
  base?: base.Base;
}

export interface RenderPromptTemplateResponse {
  message_list?: Array<Message>;
  base_resp?: base.BaseResp;
}

export interface ToolCall {
  id?: string;
  type?: ToolType;
  function_call?: FunctionCall;
}

export interface VariableDef {
  /** 变量名字 */
  key?: string;
  /** 变量描述 */
  desc?: string;
  /** 变量类型 */
  variable_type?: VariableType;
}

export interface VariableVal {
  /** 变量名字 */
  key?: string;
  /** 普通变量值 */
  value?: string;
  /** placeholder消息 */
  placeholder_messages?: Array<Message>;
}
/* eslint-enable */
