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
  type Message as OriginMessage,
  type ContentType,
  type VerboseMsgType,
  type MessageSource,
} from '@coze-common/chat-core';
import {
  type AgentType,
  type UserLabel,
} from '@coze-arch/bot-api/developer_api';
import { type MentionList } from '@coze-common/chat-uikit-shared';

/*  eslint-disable @typescript-eslint/naming-convention -- 内部属性不用 _ 开头用啥开头啊 */
interface ExtraMessageFields {
  // 内部属性，仅用于发送失败场景
  _sendFailed?: boolean;
  // 内部属性，用于标记历史记录
  _fromHistory?: boolean;
  // 内部属性，用于标记该条消息来自 onboarding
  _fromOnboarding?: boolean;
}
/* eslint-enable @typescript-eslint/naming-convention -- 解释啥啊。。 */

// eslint-disable-next-line @typescript-eslint/naming-convention -- 不遵守
type _Message<T extends ContentType, V = unknown> = OriginMessage<T, V> &
  ExtraMessageFields;

export type Message<
  T extends ContentType = ContentType,
  V = unknown,
> = _Message<T, V> & ExtraMessageFields;

export interface MessageIdStruct {
  message_id: string;
  extra_info: {
    local_message_id: string;
  };
}

export interface MessagePagination {
  hasMore: boolean;
  cursor: string;
}

export interface MessageGroupMember {
  /**
   * role: user
   * 一次对话用户只发一条消息
   */
  userMessageId: string | null;
  /**
   * role: assistant
   * type: 非 answer
   */
  functionCallMessageIdList: string[];
  /**
   * role: assistant
   * type: answer
   */
  llmAnswerMessageIdList: string[];
  // todo SuggestionInChat 的设计与这个字段分叉了
  /**
   * @deprecated 当下无用
   * type: follow_up
   */
  followUpMessageIdList: string[];
}

export interface MessageGroupInfo {
  /**
   * 用户发送了消息, 只有本地消息时为 message_id
   * 返回 ack 后为 reply_id
   */
  groupId: string;
  sectionId: string;
  selectable?: boolean;
  unSelectableTips?: string;
  /**
   * 是否是最新的分组
   */
  isLatest: boolean;
  /**
   * null - 不展示分割线
   * with-onboarding - 展示分割线和开场白
   * without-onboarding - 只展示分割线
   */
  showContextDivider: null | 'with-onboarding' | 'without-onboarding';
  // todo remove
  /**
   * @deprecated 疑似无用
   */
  showSuggestions?: boolean;
}

export type MessageGroup = { memberSet: MessageGroupMember } & MessageGroupInfo;

export type MessageUniqueKey =
  | Extract<keyof Message, 'message_id'>
  | Extract<keyof Message['extra_info'], 'local_message_id'>;

export type TextMessage = Message<ContentType.Text>;
export type ImageMessage = Message<ContentType.Image>;
export type FileMessage = Message<ContentType.File>;
export type CardMessage = Message<ContentType.Card>;
export type FunctionCallMessage = Message<ContentType.Link, { name: string }>;
export type MultimodalMessage = Message<ContentType.Mix>;
export type NormalizedFileMessage = Message<
  ContentType.File | ContentType.Image
>;

export interface SendFilePayload {
  file: File;
  mentionList: MentionList;
}

export interface MessageIdStruct {
  message_id: string;
  extra_info: {
    local_message_id: string;
  };
}

export interface MessageExtraInfoBotState {
  bot_id?: string;
  agent_id?: string;
  agent_name?: string;
  agent_type?: AgentType;
  awaiting?: string;
}

export interface KnowledgeRecallSlice {
  meta: {
    dataset: {
      id: number;
      name: string;
    };
    document: {
      id: number;
      source_type: number;
      format_type: number;
      name: string;
    };
    link: {
      title: string;
      url: string;
    };
  };
  score: number;
  slice: string;
}

export interface VerboseContentData {
  method?: string;
  condition?: string;
  agent_name?: string;
  agent_id?: string;
  arguments?: string;
  restart?: boolean; //是否回溯到start节点
  wraped_text?: string; //长期记忆展示的文案
  chunks?: KnowledgeRecallSlice[];
  /** 知识库调用状态码，0-成功 708882003-云搜索鉴权失败 */
  status_code?: number;
}

export interface MessageMeta
  extends MessageIdStruct,
    Pick<ExtraMessageFields, '_fromHistory'> {
  /** 消息展示复制、重新生成等按钮 */
  showActions: boolean;
  /** 消息后面展示 agent 分割线 */
  showMultiAgentDivider: boolean;
  /** 用户问题发送中 */
  isSending: boolean;
  /** 消息发送或接收失败 */
  isFail: boolean;
  /** 消息接收中 */
  isReceiving: boolean;
  /** 仅在 true 时展示函数调用；由对应的 tool_response 终结掉;
   * 注意非调试区（home,store,web sdk）使用该值判断 function call 展示；调试区有其他判断逻辑 */
  isFunctionCalling: boolean;
  /** 是否展示 suggestion：仅最后一条回复，且无分割线的时候才展示 */
  // TODO: lsy确认是否要删除
  // showSuggestions: boolean;
  /** 是否是来自最后一个消息组的消息 */
  isFromLatestGroup: boolean;
  /** 仅含有 message.type === 'answer'  */
  isGroupFirstAnswer: boolean;
  /** 包含 answer, [function_call, verbose], query; 顺序递减，function_call 与 verbose 顺序不定 */
  isGroupLastMessage: boolean;
  /** 当前组的最后一条 message.type === 'answer' */
  isGroupLastAnswerMessage: boolean;
  /**
   * 是否隐藏头像
   */
  hideAvatar: boolean;
  role: Message['role'];
  type: Message['type'];
  sectionId: string;
  replyId: string;
  botState: MessageExtraInfoBotState;
  /**
   * 当前group是否存在agent跳转verbose消息，用于判断是否展示agent分割线
   */
  beforeHasJumpVerbose: boolean;
  verboseMsgType: VerboseMsgType | '';
  source: MessageSource | undefined;
  // 卡片是否disabled
  cardDisabled: boolean;
}

export interface OnboardingSuggestionItem {
  content: string;
  id: string;
}

type Expect<T extends true> = T extends true ? true : never;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- 类型结构检查
type _ = Expect<Message extends MessageIdStruct ? true : false>;

export interface SenderInfo {
  url: string;
  nickname: string;
  id: string;
  allowMention: boolean;
  allowShare?: boolean;
}

export interface UserSenderInfo
  extends Omit<SenderInfo, 'revealPath' | 'allowMention'> {
  userUniqueName: string;
  userLabel: UserLabel | null;
}

export type SenderInfoMap = Record<string, SenderInfo>;
export type UserInfoMap = Record<string, UserSenderInfo>;

export enum FileStatus {
  Init,
  Uploading,
  Success,
  Canceled,
  Error,
}

export enum FileType {
  File = 'file',
  Image = 'image',
}

export interface BaseFileData {
  id: string;
  status: FileStatus;
  percent: number;
  uri: string | null;
  file: File;
}

/**
 * 除了 image 都是 normal file
 */
export interface CommonFileData extends BaseFileData {
  fileType: FileType.File;
}

export interface ImageFileData extends BaseFileData {
  meta: {
    width: number;
    height: number;
  } | null;
  fileType: FileType.Image;
}

export type FileData = CommonFileData | ImageFileData;
