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
  /** 是否允许被分享 */
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
   * 被打断问题的 local_message_id
   */
  local_message_id: string;
  /**
   * 被打断的问题id
   */
  query_message_id: string;
  /**
   * 当前问题下哪一条回复被打断了
   * 仅但被打断的消息 type = 'answer' 时传递
   */
  answer_message_id?: string;
  /**
   * 打断位置
   * 仅但被打断的消息 type = 'answer' 时传递
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
消息点赞/点踩接口类型定义
 */
export enum MessageFeedbackType {
  Default = 0,
  Like = 1,
  Unlike = 2,
}

export enum MessageFeedbackDetailType {
  UnlikeDefault = 0,
  UnlikeHarmful = 1, //有害信息
  UnlikeIncorrect = 2, //信息有误
  UnlikeNotFollowInstructions = 3, //未遵循指令
  UnlikeOthers = 4, //其他
}

export interface MessageFeedback {
  feedback_type?: MessageFeedbackType; //反馈类型
  detail_types?: MessageFeedbackDetailType[]; //细分类型
  detail_content?: string; //负反馈自定义内容，对应用户选择Others
}

export enum ReportMessageAction {
  Feedback = 0,
  Delete = 1,
  UpdataCard = 2,
}

export interface ReportMessageProps {
  bot_id?: string; //bot_id
  biz_conversation_id: string; //会话ID
  message_id: string; //消息ID
  scene?: Scene; //当前会话所处场景
  action: ReportMessageAction; //动作
  message_feedback?: MessageFeedback;
  // 卡片状态
  attributes?: {
    card_status?: Record<string, string>;
  };
}

export interface ReportMessageResponse {
  code: number;
  msg: string;
}

/* 消息点赞/点踩接口类型定义：end */

export type ChatASRProps = FormData;

export interface ChatASRResponse {
  code: number;
  data?: { text?: string };
  message: string;
}
