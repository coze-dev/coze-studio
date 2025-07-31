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

/*  eslint-disable @typescript-eslint/naming-convention -- internal properties don't need to start with _ what to start with? */
interface ExtraMessageFields {
  // Internal properties, only used to send failed scenarios
  _sendFailed?: boolean;
  // Internal properties for marking history
  _fromHistory?: boolean;
  // Internal property to flag the message as coming from onboarding
  _fromOnboarding?: boolean;
}
/* eslint-enable @typescript-eslint/naming-convention -- explain what... */

// eslint-disable-next-line @typescript-eslint/naming-convention -- non-compliance
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
   * A conversation user only sends one message
   */
  userMessageId: string | null;
  /**
   * role: assistant
   * Type: non answer
   */
  functionCallMessageIdList: string[];
  /**
   * role: assistant
   * type: answer
   */
  llmAnswerMessageIdList: string[];
  // The design of todo SuggestionInChat forks with this field
  /**
   * @deprecated now useless
   * type: follow_up
   */
  followUpMessageIdList: string[];
}

export interface MessageGroupInfo {
  /**
   * The user sent a message, only local messages are message_id
   * reply_id after returning ack
   */
  groupId: string;
  sectionId: string;
  selectable?: boolean;
  unSelectableTips?: string;
  /**
   * Is it the latest grouping?
   */
  isLatest: boolean;
  /**
   * Null - do not show split lines
   * With-onboarding - Show splits and openers
   * Without-onboarding - Show only split lines
   */
  showContextDivider: null | 'with-onboarding' | 'without-onboarding';
  // todo remove
  /**
   * @deprecated suspected useless
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
  restart?: boolean; //Whether to go back to the start node
  wraped_text?: string; //Copywriting for long-term memory display
  chunks?: KnowledgeRecallSlice[];
  /** Knowledge base call status code, 0-success 708882003-cloud search authentication failed */
  status_code?: number;
}

export interface MessageMeta
  extends MessageIdStruct,
    Pick<ExtraMessageFields, '_fromHistory'> {
  /** Message display Copy, regenerate and other buttons */
  showActions: boolean;
  /** The agent split line is displayed after the message. */
  showMultiAgentDivider: boolean;
  /** User question is being sent. */
  isSending: boolean;
  /** Message sending or receiving failed */
  isFail: boolean;
  /** Message receiving */
  isReceiving: boolean;
  /** Exhibits function calls only when true; terminated by the corresponding tool_response;
   * Note that the non-debug area (home, store, web sdk) uses this value to determine the display of the function call; the debug area has other judgment logic */
  isFunctionCalling: boolean;
  /** Whether to show suggestion: Only show the last reply when there is no dividing line */
  // TODO: lsy confirm whether to delete
  // showSuggestions: boolean;
  /** Is it a message from the last message group? */
  isFromLatestGroup: boolean;
  /** Contains only message.type === 'answer'  */
  isGroupFirstAnswer: boolean;
  /** Contains answer, [function_call, verbose], query; in decreasing order, function_call and verbose in variable order */
  isGroupLastMessage: boolean;
  /** The last message of the current group. Type === 'answer' */
  isGroupLastAnswerMessage: boolean;
  /**
   * Whether to hide the avatar
   */
  hideAvatar: boolean;
  role: Message['role'];
  type: Message['type'];
  sectionId: string;
  replyId: string;
  botState: MessageExtraInfoBotState;
  /**
   * Whether there is an agent jump verbose message in the current group, which is used to determine whether to display the agent split line
   */
  beforeHasJumpVerbose: boolean;
  verboseMsgType: VerboseMsgType | '';
  source: MessageSource | undefined;
  // Is the card disabled?
  cardDisabled: boolean;
}

export interface OnboardingSuggestionItem {
  content: string;
  id: string;
}

type Expect<T extends true> = T extends true ? true : never;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars -- type structure checking
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
 * Except the images are normal files
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
