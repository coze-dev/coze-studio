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

import { nanoid } from 'nanoid';
import {
  ContentType,
  type RequestManagerOptions,
  type ParsedEvent,
} from '@coze-common/chat-core';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { type CreateChatData, type ChatV3Message } from '@coze/api';

import { catchParse } from '@/util';
import { type OpenUserInfo } from '@/types/user';

import { messageConverterToCoze } from './message-convert-to-coze';

type MessageParserFunc = ReturnType<
  Required<Required<RequestManagerOptions>['hooks']>['onGetMessageStreamParser']
>;
// 消息解析，主要用于从服务端获取到消息后，解析成coze能适配的数据结构
enum ChunkEvent {
  ERROR = 'error',
  DONE = 'done',
  MESSAGE_DELTA = 'conversation.message.delta',
  MESSAGE_COMPLETED = 'conversation.message.completed',
  // 其他消息暂时不处理，中间过程消息。
  CHAT_COMPLETED = 'conversation.chat.completed',
  CHAT_CREATED = 'conversation.chat.created',
  CHAT_FAILED = 'conversation.chat.failed',
}

export class MessageParser {
  private seqNo = 0; //标识消息的序号
  private indexNo = 0; //标识类型的序号
  private indexNoMap: Record<string, number> = {};
  private conversationId = '';
  private localMessageId = '';
  private sendMessageContent = '';
  private sendMessageContentType = '';
  private botId = '';
  private sectionId = '';
  private botVersion = '';
  private userInfo?: OpenUserInfo;
  constructor({
    requestMessageRawBody,
    userInfo,
    sectionId,
  }: {
    requestMessageRawBody: Record<string, unknown>;
    userInfo?: OpenUserInfo;
    sectionId?: string;
  }) {
    this.conversationId = requestMessageRawBody.conversation_id as string;
    this.localMessageId = requestMessageRawBody.local_message_id as string;
    this.sendMessageContent = requestMessageRawBody.query as string;
    this.sendMessageContentType = requestMessageRawBody.content_type as string;
    this.botId = requestMessageRawBody.bot_id as string;
    this.botVersion = requestMessageRawBody.bot_version as string;
    this.userInfo = userInfo;
    this.sectionId = sectionId || '';
  }
  public parse(
    parseEvent: Partial<ParsedEvent>,
    { terminate }: { terminate: () => void },
  ): ParsedEvent | undefined {
    const { data, event } = parseEvent;
    switch (event) {
      case ChunkEvent.CHAT_CREATED: {
        return this.createAckMessage(data as string) as unknown as ParsedEvent;
      }
      case ChunkEvent.MESSAGE_DELTA: {
        const message = this.createMessage(data as string);
        if (!message) {
          return;
        }
        return message as unknown as ParsedEvent;
      }
      case ChunkEvent.MESSAGE_COMPLETED: {
        return this.createMessage(
          data as string,
          true,
        ) as unknown as ParsedEvent;
      }
      case ChunkEvent.CHAT_COMPLETED:
      case ChunkEvent.DONE: {
        terminate();
        return;
      }
      // 对话过程中出现异常，例如：token 消耗完了
      case ChunkEvent.CHAT_FAILED: {
        const messageError = safeJSONParse(data) as CreateChatData;
        const errorMsg = messageError.last_error?.msg || I18n.t('sendFailed');

        Toast.error(errorMsg);
        throw new Error('Chat stream error');
      }
      case ChunkEvent.ERROR: {
        const messageError = safeJSONParse(data) as {
          code: number;
          msg: string;
        };
        const errorMsg = messageError?.msg || I18n.t('sendFailed');
        Toast.error(errorMsg);
        throw new Error('Chat stream error');
      }
      default:
        return;
    }
  }

  private createMessage(data: string, isComplete = false) {
    const dataValue = catchParse<ChatV3Message>(data);
    if (!dataValue) {
      return;
    }
    const messageType = dataValue?.type || '';
    dataValue.chat_id =
      !dataValue.chat_id || dataValue.chat_id === '0' ? '' : dataValue.chat_id;
    dataValue.id = !dataValue.id || dataValue.id === '0' ? '' : dataValue.id;

    const message = messageConverterToCoze.convertMessage(
      dataValue,
      this.botId,
    );
    if (!message) {
      return;
    }
    if (
      isComplete &&
      message.content_type === ContentType.Text &&
      message.type === 'answer'
    ) {
      message.content = '';
    }
    message.section_id = message.section_id || this.sectionId;
    return {
      event: 'message',
      data: {
        conversation_id: this.conversationId,
        index: this.getIndexNo(messageType),
        is_finish: isComplete,
        seq_id: this.getSeqNo(),
        message: { ...message, sender: this.botId },
      },
    };
  }
  private createAckMessage(data: string) {
    const messageType = 'ack';
    const dataValue = catchParse<CreateChatData & { execute_id?: string }>(
      data,
    );
    if (!dataValue) {
      return;
    }
    const chatId = dataValue?.id === '0' || !dataValue?.id ? '' : dataValue?.id;
    const replyId = chatId || `--custom-replyId--${nanoid()}`;
    // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
    const messageId = dataValue.inserted_additional_messages?.lastItem?.id;

    return {
      event: 'message',
      data: {
        conversation_id: this.conversationId,
        index: this.getIndexNo(messageType),
        is_finish: true,
        message: {
          content: this.sendMessageContent,
          content_time: (dataValue?.created_at || 0) * 1000,
          content_type: this.sendMessageContentType,
          extra_info: {
            local_message_id: this.localMessageId,
            chatflow_execute_id: dataValue?.execute_id,
            coze_api_message_id: messageId,
            coze_api_chat_id: chatId,
          },
          message_id: replyId,
          reply_id: replyId,
          role: 'user',
          // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
          section_id: dataValue?.section_id || this.sectionId, //todo 添加代码
          sender_id: this.userInfo?.id,
          source: 0, //...
          status: '',
          type: messageType,
        },
        seq_id: this.getSeqNo(),
      },
    };
  }

  private getSeqNo() {
    return this.seqNo++;
  }
  private getIndexNo(messageType: string) {
    if (!this.indexNoMap[messageType]) {
      this.indexNoMap[messageType] = this.indexNo++;
    }
    return this.indexNoMap[messageType];
  }

  static getMessageParser({
    requestMessageRawBody,
    userInfo,
    sectionId,
  }: {
    requestMessageRawBody: Record<string, unknown>;
    userInfo?: OpenUserInfo;
    sectionId?: string;
  }): MessageParserFunc {
    let parser: MessageParser | undefined = new MessageParser({
      requestMessageRawBody,
      userInfo,
      sectionId,
    });
    const destroy = () => {
      parser = undefined;
    };
    return (parseEvent, method) => {
      const { terminate } = method;
      const { type, event } = parseEvent as ParsedEvent & { type: string };
      if (type === 'event') {
        //
        const result = parser?.parse(parseEvent as ParsedEvent, { terminate });
        if (
          [ChunkEvent.DONE, ChunkEvent.ERROR, ChunkEvent.CHAT_FAILED].includes(
            event as ChunkEvent,
          )
        ) {
          destroy();
        }
        return result;
      }
    };
  }
}
