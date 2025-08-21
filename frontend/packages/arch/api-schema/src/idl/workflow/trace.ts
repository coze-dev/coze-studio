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

import * as base from './../base';
export { base };
export enum FrontedTagType {
  /** Text */
  TEXT = 0,
  /** Time, with timestamp, in milliseconds */
  TIME = 1,
  /** Time interval, in milliseconds */
  TIME_DURATION = 2,
}
/** Tag */
export interface TraceTag {
  key: string,
  tag_type: TagType,
  value: Value,
}
export interface FilterTag {
  data_type?: string,
  tag_key?: string,
  multi_tag_keys?: string[],
  values?: string[],
  query_type?: QueryTypeEnum,
}
export enum QueryTypeEnum {
  Undefined = 0,
  Match = 1,
  Term = 2,
  Range = 3,
  Exist = 4,
  NotExist = 5,
}
export enum SpanStatus {
  Unknown = 0,
  Success = 1,
  Fail = 2,
}
export interface ListRootSpansRequest {
  /** It's in milliseconds. */
  start_at: number,
  /** It's in milliseconds. */
  end_at: number,
  limit?: number,
  desc_by_start_time?: boolean,
  offset?: number,
  workflow_id: string,
  input?: string,
  status?: SpanStatus,
  /** Formal run/practice run/Node Debug */
  execute_mode?: number,
}
export interface Span {
  trace_id: string,
  log_id: string,
  psm: string,
  dc: string,
  pod_name: string,
  span_id: string,
  type: string,
  name: string,
  parent_id: string,
  /** It's in milliseconds. */
  duration: number,
  /** It's in milliseconds. */
  start_time: number,
  status_code: number,
  tags: TraceTag[],
}
export interface Value {
  v_str?: string,
  v_double?: number,
  v_bool?: boolean,
  v_long?: number,
  v_bytes?: Blob,
}
export enum TagType {
  STRING = 0,
  DOUBLE = 1,
  BOOL = 2,
  LONG = 3,
  BYTES = 4,
}
export interface ListRootSpansResponse {
  spans?: Span[]
}
export interface GetTraceSDKRequest {
  log_id?: string,
  /** It's in milliseconds. */
  start_at?: number,
  /** It's in milliseconds. */
  end_at?: number,
  workflow_id?: number,
  execute_id?: number,
}
export enum QueryScene {
  /** Doubao cici full link debugging station */
  ALICE_OP = 0,
  /** Doubao cici debugging function */
  DOUBAO_CICI_DEBUG = 1,
  /** Workflow debugging */
  WORKFLOW_DEBUG = 2,
}
export enum TenantLevel {
  Ordinary = 0,
  AdvancedWhitelist = 1,
}
export interface GetTraceSDKResponse {
  data?: TraceFrontend
}
export interface KeyScene {
  /** Scenarios such as "Split search terms"\ "Search" */
  scene?: string,
  /** status information */
  status_message?: string,
  system?: string,
  /** chat history */
  history_messages?: MessageItem[],
  /** input */
  input?: KeySceneInput,
  /** output */
  output?: KeySceneOutput,
  /** It's in milliseconds. */
  duration?: number,
  /** Start time, used for sorting, in milliseconds */
  start_time?: number,
  /** subscene */
  sub_key_scenes?: KeyScene[],
}
export interface KeySceneInput {
  role?: string,
  content_list?: TraceSummaryContent[],
}
export interface KeySceneOutput {
  role?: string,
  content_list?: TraceSummaryContent[],
}
export interface TraceSummaryContent {
  /** key */
  key?: string,
  /** content */
  content?: string,
}
export interface MessageItem {
  /** role */
  role?: string,
  /** content */
  content?: string,
}
export interface SpanSummary {
  tags?: FrontendTag[]
}
export interface FrontendTag {
  key: string,
  /** Multilingual, if there is no configuration value, use the key */
  key_alias?: string,
  tag_type: TagType,
  value?: Value,
  /** Front-end type for front-end processing */
  frontend_tag_type?: FrontedTagType,
  /** Can it be copied? */
  can_copy?: boolean,
}
export interface TraceSummary {
  /** System 1 text */
  system?: string,
  /** Level 1 chat history */
  history_messages?: MessageItem[],
  key_scenes?: KeyScene[],
  /** input */
  input?: string,
  /** output */
  output?: string,
  /** The duration of the current conversation, in milliseconds */
  duration?: number,
  /** user ID */
  user_id?: string,
}
export interface TraceHeader {
  /** It's in milliseconds. */
  duration?: number,
  /** Enter the number of tokens consumed */
  tokens?: number,
  status_code?: number,
  tags?: FrontendTag[],
  /** Message ID */
  message_id?: string,
  /** It's in milliseconds. */
  start_time?: number,
}
export interface TraceFrontend {
  spans?: TraceFrontendSpan[],
  header?: TraceHeader,
}
export interface TraceFrontendDoubaoCiciDebug {
  spans?: TraceFrontendSpan[],
  header?: TraceHeader,
  summary?: TraceSummary,
}
export enum InputOutputType {
  /** Text type */
  TEXT = 0,
}
export interface SpanInputOutput {
  /** TEXT */
  type?: InputOutputType,
  content?: string,
}
export interface TraceFrontendSpan {
  trace_id: string,
  log_id: string,
  span_id: string,
  type: string,
  name: string,
  alias_name: string,
  parent_id: string,
  /** It's in milliseconds. */
  duration: number,
  /** It's in milliseconds. */
  start_time: number,
  status_code: number,
  tags?: TraceTag[],
  /** node details */
  summary?: SpanSummary,
  input?: SpanInputOutput,
  output?: SpanInputOutput,
  /** Is it an entry node? */
  is_entry?: boolean,
  /** product line */
  product_line?: string,
  /** Is it a key node? */
  is_key_span?: boolean,
  /** Node owner list, mailbox prefix */
  owner_list?: string[],
  /** Node Details Document */
  rundown_doc_url?: string,
}