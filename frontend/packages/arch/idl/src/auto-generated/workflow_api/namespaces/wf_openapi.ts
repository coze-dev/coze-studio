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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum SuggestReplyInfoMode {
  /** 关闭 */
  Disable = 0,
  /** 系统 */
  System = 1,
  /** 自定义 */
  Custom = 2,
}

export interface EnterMessage {
  role: string;
  /** 内容 */
  content?: string;
  meta_data?: Record<string, string>;
  /** text/card/object_string */
  content_type?: string;
  type?: string;
}

export interface InsertedAdditionalMessage {
  id: string;
}

export interface InterruptFunction {
  name?: string;
  arguments?: string;
}

export interface InterruptPlugin {
  id?: string;
  type?: string;
  function?: InterruptFunction;
  require_info?: InterruptRequireInfo;
}

export interface InterruptRequireInfo {
  infos?: Array<string>;
}

export interface LastError {
  code: number;
  msg: string;
}

export interface RequiredAction {
  type?: string;
  submit_tool_outputs?: SubmitToolOutputs;
}

export interface SubmitToolOutputs {
  tool_calls?: Array<InterruptPlugin>;
}

/** suggest */
export interface SuggestReplyInfo {
  /** 对应 Coze Auto-Suggestion
建议问题模型 */
  suggest_reply_mode?: SuggestReplyInfoMode;
  /** 用户自定义建议问题 */
  customized_suggest_prompt?: string;
}

export interface Usage {
  token_count?: number;
  output_count?: number;
  input_count?: number;
}

export interface WorkflowChatData {
  /** MessageDetail */
  id?: string;
  conversation_id?: string;
  bot_id?: string;
  role?: string;
  type?: string;
  content?: string;
  content_type?: string;
  meta_data?: Record<string, string>;
  chat_id?: string;
  section_id?: string;
  created_at?: number;
  updated_at?: number;
  /** ChatDetail */
  completed_at?: number;
  failed_at?: number;
  last_error?: LastError;
  status?: string;
  usage?: Usage;
  required_action?: RequiredAction;
  execute_id?: string;
  inserted_additional_messages?: Array<InsertedAdditionalMessage>;
  /** 错误信息 */
  code?: number;
  msg?: string;
  /** Done Message
调试链接 , DONE 时返回 */
  debug_url?: string;
}
/* eslint-enable */
