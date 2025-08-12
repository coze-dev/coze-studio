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

import {
  type ChatASRProps,
  type BreakMessageProps,
  type DeleteMessageProps,
  type GetHistoryMessageProps,
  type ReportMessageProps,
} from '../../../message/types/message-manager';

export type GetHistoryMessageParams = Omit<
  GetHistoryMessageProps,
  'conversation_id' | 'scene' | 'bot_id' | 'preset_bot' | 'draft_mode'
>;

export type DeleteMessageParams = Omit<
  DeleteMessageProps,
  'conversation_id' | 'bot_id'
>;

export type ReportMessageParams = Omit<
  ReportMessageProps,
  'biz_conversation_id' | 'bot_id' | 'scene'
>;

export type BreakMessageParams = Omit<BreakMessageProps, 'conversation_id'>;

export type ChatASRParams = ChatASRProps;
