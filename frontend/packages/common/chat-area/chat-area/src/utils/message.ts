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
  ContentType,
  type MessageSource,
  messageSource,
} from '@coze-common/chat-core';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import {
  type CardMessage,
  type FileData,
  type FileMessage,
  type ImageMessage,
  type Message,
  type MessageIdStruct,
  type MessageMeta,
  type MultimodalMessage,
  type TextMessage,
} from '../store/types';
import { type ChatAreaConfigs } from '../context/chat-area-context/type';
import { getIsFunctionCallType } from './function-call-message-type';

export const getMessageUniqueKey = (message: MessageIdStruct): string => {
  if (message.message_id) {
    return message.message_id;
  }
  const localMessageId = message.extra_info.local_message_id;
  if (!localMessageId) {
    throw new Error('message without any id');
  }
  return localMessageId;
};

export const findMessageByIdStruct = <Msg extends MessageIdStruct>(
  messages: Msg[],
  idStruct: MessageIdStruct,
) => {
  const messageId = idStruct.message_id;
  const item = findMessageById(messages, messageId);
  if (item !== undefined) {
    return item;
  }
  const localMessageId = idStruct.extra_info.local_message_id;
  return findMessageById(messages, localMessageId);
};

export const findMessagesByReplyId = <Msg extends Pick<Message, 'reply_id'>>(
  messages: Msg[],
  replyId: string,
) => messages.filter(message => message.reply_id === replyId);

export const findMessageIndexByIdStruct = <Msg extends MessageIdStruct>(
  messages: Msg[],
  idStruct: MessageIdStruct,
) => {
  const messageId = idStruct.message_id;
  const idx = findMessageIndexById(messages, messageId);
  if (idx >= 0) {
    return idx;
  }
  const localMessageId = idStruct.extra_info.local_message_id;
  return findMessageIndexById(messages, localMessageId);
};

export const checkMessageHasUniqId = <Msg extends MessageIdStruct>(
  msg: Msg,
  id: string,
) => msg.message_id === id || msg.extra_info.local_message_id === id;

export const findMessageById = <Msg extends MessageIdStruct>(
  messages: Msg[],
  id: string,
) => {
  if (!id) {
    return;
  }
  return messages.find(msg => checkMessageHasUniqId(msg, id));
};

export const findMessageIndexById = <Msg extends MessageIdStruct>(
  messages: Msg[],
  id: string,
) => {
  if (!id) {
    return -1;
  }
  return messages.findIndex(msg => checkMessageHasUniqId(msg, id));
};

export const getIsAnswer = (message?: Message): boolean =>
  Boolean(message && message.type === 'answer');

// text message
export const getIsTextMessage = (message?: Message): message is TextMessage =>
  message?.content_type === ContentType.Text;

// file message
export const getIsFileMessage = (message?: Message): message is FileMessage =>
  message?.content_type === ContentType.File;

// picture message
export const getIsImageMessage = (message?: Message): message is ImageMessage =>
  message?.content_type === ContentType.Image;

// Card message
export const getIsCardMessage = (message?: Message): message is CardMessage =>
  message?.content_type === ContentType.Card;

// Suggestion message
export const getIsSuggestions = (message?: Message): message is TextMessage =>
  message?.content_type === ContentType.Text && message.type === 'follow_up';

export const getIsMultimodalMessage = (
  message?: Message,
): message is MultimodalMessage => message?.content_type === ContentType.Mix;

/** Unconditional, must hide */
const hiddenMessageType: Message['type'][] = ['tool_response'];

/**
 * Used for message list filtering to display messages.
 * This layer is the first screening, and the message box will be further filtered.
 *
 * Filter out based on rules:
 * 1. Must not display type (tool_response)
 * 2. Undisplayed type (function call) if from history
 */
export const getIsVisibleMessageMeta = (
  meta: MessageMeta,
  configs?: Partial<ChatAreaConfigs>,
) => {
  if (hiddenMessageType.includes(meta.type)) {
    return false;
  }

  const { showFunctionCallDetail = true } = configs ?? {};

  if (
    !showFunctionCallDetail &&
    getIsFunctionCallType(meta.type) &&
    !meta.isFunctionCalling
  ) {
    return false;
  }

  return true;
};

type MessageTestField = keyof Pick<Message, 'role' | 'type' | 'content'>;
// spot check attributes
const messageTestFields: MessageTestField[] = ['content', 'type', 'role'];

export const getIsValidMessage = (
  struct?: MessageIdStruct,
): struct is Message =>
  struct !== undefined && messageTestFields.every(field => field in struct);

export const getFinalAnswerMessageAndMetaList = ({
  messageList,
  metaList,
}: {
  messageList: Message[];
  metaList: MessageMeta[];
}): [Message[], MessageMeta[]] => {
  const isValidMessage = (item: Message | MessageMeta) =>
    (item.role === 'assistant' && item.type === 'answer') ||
    getIsTriggerMessage(item);

  const finalMessageList = messageList.filter(isValidMessage);
  const finalMetaList = metaList.filter(isValidMessage);

  return [finalMessageList, finalMetaList];
};

export const serializeIdStruct = (msg: MessageIdStruct) =>
  `message_id: ${msg.message_id}, local message id: ${msg.extra_info.local_message_id}`;

export const getSendMultimodalMessageStrategy = (
  text: string,
  fileDataList: FileData[],
) => {
  const hasFile = Boolean(fileDataList.length);
  const hasText = Boolean(text.trim());

  if (!hasFile && !hasText) {
    safeAsyncThrow('invalid send message case');
  }

  if (!hasFile) {
    return 'text';
  }

  // if (!hasText) {
  //   const fileTypeSet = new Set(fileDataList.map(data => data.fileType));
  //   if (fileTypeSet.size === 1) {
  //     return fileTypeSet.has(FileType.File) ? 'file' : 'image';
  //   }
  // }

  return 'multimodal';
};

export const convertMessageSource = (source: number): MessageSource => {
  const values: number[] = Object.values(messageSource);
  if (!values.includes(source)) {
    throw new Error(`unhandled message: ${messageSource}`);
  }
  return source as MessageSource;
};

export const getIsPureAnswerMessage = ({
  type,
  source,
}: Pick<Message, 'type' | 'source'>): boolean => {
  if (type !== 'answer') {
    return false;
  }
  if (source === undefined) {
    return true;
  }
  return source === messageSource.Chat;
};

export const getIsTriggerMessage = ({
  type,
  source,
}: Pick<Message, 'type' | 'source'>) =>
  type === 'task_manual_trigger' || source === messageSource.TaskManualTrigger;

export const getIsNotificationMessage = ({ source }: Pick<Message, 'source'>) =>
  source === messageSource.Notice;
export const getIsAsyncResultMessage = ({ source }: Pick<Message, 'source'>) =>
  source === messageSource.AsyncResult;

// Card disabled logic:
// 1. card message
// 2. Not the last item in the message list with type answer or role user
export const getIsCardDisabled = (
  index: number,
  messageList: Message[],
): boolean => {
  const message = messageList[index];

  if (!message) {
    throw new Error(`cannot find message of index: ${index}`);
  }
  if (message.type !== 'answer') {
    return false;
  }

  const isCardContent = getIsCardMessage(message);

  const isNotFirstAnswerQuestion =
    messageList
      .filter(item => item.type === 'answer' || item.role === 'user')
      ?.at(0)?.message_id !== message.message_id;

  return isCardContent && isNotFirstAnswerQuestion;
};

const getToastI18nMap = () => ({
  VOICE_NOT_RECOGNIZE: I18n.t('chat_voice_input_toast_no_content_recognized'),
  TOKEN_INSUFFICIENT_VOICE: I18n.t('coze_free_credits_insufficient'),
  PRO_TOKEN_INSUFFICIENT_VOICE: I18n.t('coze_pro_payment_overdue'),
});
export const toastBySendMessageResult = (
  result: 'LOCKED' | undefined | keyof ReturnType<typeof getToastI18nMap>,
) => {
  if (result === 'LOCKED' || typeof result === 'undefined') {
    return;
  }
  const i18nMap = getToastI18nMap();
  Toast.error({ content: i18nMap[result], showClose: false });
};

export const isFallbackErrorMessage = (message: Pick<Message, 'message_id'>) =>
  /** If it is an error cover message, it is fixed to the end of the _error, which has been agreed with the server level */
  message.message_id.endsWith('_error');
