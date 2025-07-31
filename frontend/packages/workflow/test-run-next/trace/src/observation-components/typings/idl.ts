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
  /** Text */
  TEXT = 0,
  /** Time, with timestamp, in microseconds */
  TIME = 1,
  /** Time interval, in microseconds */
  TIME_DURATION = 2,
}

export interface FrontendTag {
  key: string;
  /** Multilingual, if there is no configuration value, use the key */
  key_alias?: string;
  tag_type: TagType;
  value?: Value;
  /** For custom rendering */
  element?: ReactNode;
  /** Front-end type for front-end processing */
  frontend_tag_type?: FrontedTagType;
  /** Can it be copied? */
  can_copy?: boolean;
}

export interface Tag {
  key?: string;
  tag_type?: TagType;
  value?: Value;
}

export enum InputOutputType {
  /** Text type */
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
  /** That's in microseconds. */
  duration?: Int64;
  /** That's in microseconds. */
  start_time?: Int64;
  status_code?: number;
  product_line?: string;
  is_entry?: boolean;
  is_key_span?: boolean;
  owner_list?: Array<string>;
  rundown_doc_url?: string;
  tags?: Array<Tag>;
  /** node details */
  summary?: SpanSummary;
  input?: SpanInputOutput;
  output?: SpanInputOutput;
}

export interface TraceHeader {
  /** That's in microseconds. */
  duration?: Int64;
  /** Enter the number of tokens consumed */
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
