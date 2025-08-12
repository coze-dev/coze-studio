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
  type Message,
  type ContentType,
  type Scene,
  type LoadDirection,
} from '../../chat-sdk/types/interface';

export interface GetHistoryMessageProps {
  conversation_id: string;
  cursor: string;
  count: number;
  scene?: Scene;
  bot_id?: string;
  draft_mode?: boolean;
  preset_bot?: string;
  load_direction?: LoadDirection;
}

export enum MsgParticipantType {
  Bot = 1,
  User = 2,
}

export interface ParticipantInfo {
  id: string;
  type?: MsgParticipantType;
  name: string;
  desc?: string;
  avatar_url: string;
  space_id?: string;
  user_id?: string;
  user_name?: string;
  allow_mention: boolean;
  access_path: string | undefined;
  /** Is it allowed to be shared? */
  allow_share?: boolean;
}

export interface GetHistoryMessageResponse {
  message_list: Message<ContentType>[];
  cursor: string;
  hasmore: boolean;
  next_has_more?: boolean;
  next_cursor?: string;
  read_message_index?: string;
  code?: number;
  msg?: string;
  participant_info_map?: Record<string, Partial<ParticipantInfo>>;
  last_section_id: string;
}

export interface ClearHistoryProps {
  bot_id: string;
  conversation_id: string;
  scene?: Scene;
}

export interface ClearHistoryResponse {
  code: number;
  msg: string;
  new_section_id: string;
  new_section_message_list: Message<ContentType>[];
}

export interface ClearMessageContextProps {
  conversation_id: string;
  insert_history_message_list: string[];
  scene?: Scene;
}

export interface ClearMessageContextResponse {
  code: number;
  msg: string;
  new_section_id: string;
  new_section_message_list: Message<ContentType>[];
}

export interface DeleteMessageProps {
  bot_id: string;
  conversation_id: string;
  message_id: string;
  scene?: Scene;
}

export interface DeleteMessageResponse {
  code: number;
  msg: string;
}

export interface BreakMessageProps {
  conversation_id: string;
  /**
   * local_message_id of interrupted questions
   */
  local_message_id: string;
  /**
   * Interrupted question id
   */
  query_message_id: string;
  /**
   * Which reply was interrupted under the current question?
   * Only delivered if the interrupted message type = 'answer'
   */
  answer_message_id?: string;
  /**
   * interrupt position
   * Only delivered if the interrupted message type = 'answer'
   */
  broken_pos?: number;

  scene?: Scene;
}

export interface BreakMessageResponse {
  code: number;
  msg: string;
}

export type ClearMessageContextParams = Pick<
  ClearMessageContextProps,
  'insert_history_message_list'
>;

/*
Message Like/Click Interface Type Definition
 */
export enum MessageFeedbackType {
  Default = 0,
  Like = 1,
  Unlike = 2,
}

export enum MessageFeedbackDetailType {
  UnlikeDefault = 0,
  UnlikeHarmful = 1, //Harmful information
  UnlikeIncorrect = 2, //incorrect information
  UnlikeNotFollowInstructions = 3, //Did not follow instructions
  UnlikeOthers = 4, //other
}

export interface MessageFeedback {
  feedback_type?: MessageFeedbackType; //feedback type
  detail_types?: MessageFeedbackDetailType[]; //segmentation type
  detail_content?: string; //Negative feedback custom content, corresponding to user selection Others
}

export enum ReportMessageAction {
  Feedback = 0,
  Delete = 1,
  UpdataCard = 2,
}

export interface ReportMessageProps {
  bot_id?: string; //bot_id
  biz_conversation_id: string; //Session ID
  message_id: string; //Message ID
  scene?: Scene; //The scene of the current session
  action: ReportMessageAction; //action
  message_feedback?: MessageFeedback;
  // Card Status
  attributes?: {
    card_status?: Record<string, string>;
  };
}

export interface ReportMessageResponse {
  code: number;
  msg: string;
}

/* Message Like/Click Interface Type Definition: end */

export type ChatASRProps = FormData;

export interface ChatASRResponse {
  code: number;
  data?: { text?: string };
  message: string;
}
