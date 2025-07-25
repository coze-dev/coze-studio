/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { type ReactNode } from 'react';

export type Int64 = string | number;

export enum TagType {
  STRING = 0,
  DOUBLE = 1,
  BOOL = 2,
  LONG = 3,
  BYTES = 4,
}

export interface Value {
  v_str?: string;
  v_double?: number;
  v_bool?: boolean;
  v_long?: Int64;
  v_bytes?: Blob;
}

export enum FrontedTagType {
  /** 文本 */
  TEXT = 0,
  /** 时间，用时间戳，单位是微秒 */
  TIME = 1,
  /** 时间间隔，单位是微秒 */
  TIME_DURATION = 2,
}

export interface FrontendTag {
  key: string;
  /** 多语，如无配置时值沿用 key */
  key_alias?: string;
  tag_type: TagType;
  value?: Value;
  /** 用于自定义渲染 */
  element?: ReactNode;
  /** 前端类型，用于前端处理 */
  frontend_tag_type?: FrontedTagType;
  /** 是否可复制 */
  can_copy?: boolean;
}

export interface Tag {
  key?: string;
  tag_type?: TagType;
  value?: Value;
}

export enum InputOutputType {
  /** 文本类型 */
  TEXT = 0,
}

export interface SpanSummary {
  tags?: Array<FrontendTag>;
}

export interface SpanInputOutput {
  /** TEXT */
  type?: InputOutputType;
  content?: string;
}

export interface TraceFrontendSpan {
  trace_id?: string;
  log_id?: string;
  span_id?: string;
  type?: string;
  name?: string;
  alias_name?: string;
  parent_id?: string;
  /** 单位是微秒 */
  duration?: Int64;
  /** 单位是微秒 */
  start_time?: Int64;
  status_code?: number;
  product_line?: string;
  is_entry?: boolean;
  is_key_span?: boolean;
  owner_list?: Array<string>;
  rundown_doc_url?: string;
  tags?: Array<Tag>;
  /** 节点详情 */
  summary?: SpanSummary;
  input?: SpanInputOutput;
  output?: SpanInputOutput;
}

export interface TraceHeader {
  /** 单位是微秒 */
  duration?: Int64;
  /** 输入消耗token数 */
  tokens?: number;
  status_code?: number;
  tags?: Array<FrontendTag>;
}

export interface TraceFrontend {
  spans?: Array<TraceFrontendSpan>;
  header?: TraceHeader;
}
export interface MessageRenderOptions {
  expandable?: boolean;
  defaultExpand?: boolean;
  showRole?: boolean;
  rawMessageItem?: boolean;
}

export enum MessageRole {
  User = 'User',
  Assistant = 'Assistant',
  System = 'System',
  Tool = 'Tool',
}

export enum MessageScene {
  Input = 'Input',
  Output = 'Output',
  History = 'History',
  System = 'System',
  Tool = 'Tool',
}

export enum KeySceneField {
  Status = '状态',
  System = 'System',
  History = '消息列表',
  Input = '输入',
  Output = '输出',
}
