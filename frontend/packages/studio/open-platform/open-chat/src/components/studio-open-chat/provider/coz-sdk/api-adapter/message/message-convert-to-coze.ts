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
import { getFileInfo, FileTypeEnum } from '@coze-studio/file-kit/logic';
import { ContentType } from '@coze-common/chat-core';
import {
  type ChatV3Message,
  type ContentType as SdkContentType,
  type ListMessageData,
} from '@coze/api';

import { catchParse } from '@/util';

interface ObjectStringItem {
  type: 'text' | 'image' | 'file';
  text?: string;
  file_id?: string;
  file_url?: string;
}
const microSeconds = 1000;
// 消息转换成 Coze的消息，主要用于消息接收后，在页面显示。
class MessageConverseToCoze {
  public convertMessageListResponse(res: ListMessageData, botId = '') {
    const {
      data: messageList = [],
      has_more: hasMore,
      first_id: firstId,
      last_id: lastId,
    } = res;
    const messageListForCoze =
      messageList
        .map(item => this.convertMessage(item, botId))
        .filter(item => !!item.message_id) || [];
    console.log('messageListForCoze', messageListForCoze);
    return {
      code: 0,
      message_list: messageListForCoze,
      hasmore: hasMore,
      cursor: lastId,
      next_cursor: firstId,
    };
  }
  public convertMessage(message: ChatV3Message, botId = '') {
    const { content_type, content } =
      this.convertContent(message.content_type, message.content as string) ||
      {};
    const isQuestion = message.type === ('question' as ChatV3Message['type']);
    const replyId = message.chat_id || `--custom-replyId--${nanoid()}`;
    const messageId = isQuestion
      ? replyId
      : message.id || `--custom-messageId-${nanoid()}`; // 无messageId，输出一个默认的

    const senderId = isQuestion ? '' : message.bot_id || botId;
    if (!content_type || !messageId || !replyId) {
      return {};
    }
    let pluginName = '';
    if (message.type === 'function_call') {
      const contentObj = catchParse<{ plugin: string }>(
        message.content as string,
      );
      pluginName = contentObj?.plugin || '';
    }

    return {
      // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
      reasoning_content: message.reasoning_content,
      content,
      content_time: (message.created_at || 0) * microSeconds,
      content_type,
      message_id: messageId,
      reply_id: replyId,
      role: message.role,

      // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
      section_id: message.section_id,
      sender_id: senderId, // todo 用户id添加
      source: 0, //...
      status: '',
      extra_info: {
        local_message_id: '',
        plugin: pluginName,
        coze_api_message_id: message.id,
        coze_api_chat_id: message.chat_id,
      },
      type: message.type,
    };
  }
  public convertContent(contentType: SdkContentType, content: string) {
    switch (contentType) {
      case 'object_string': {
        return {
          content_type: ContentType.Mix,
          content: this.convertMixContent(content),
        };
      }
      case 'card': {
        return {
          content_type: ContentType.Card,
          content,
        };
      }
      case 'text': {
        return {
          content_type: ContentType.Text,
          content,
        };
      }
      default: {
        return;
      }
    }
  }
  private convertMixContent(content: string) {
    const contentObj = catchParse<ObjectStringItem[]>(content);
    if (!contentObj) {
      return;
    }
    const itemList = contentObj
      ?.map(item => {
        switch (item.type) {
          case 'text': {
            return {
              type: ContentType.Text,
              text: item.text || '',
              // @ts-expect-error -- linter-disable-autofix
              is_refer: item.is_refer || undefined,
            };
          }
          case 'image': {
            return {
              type: ContentType.Image,
              image: {
                key: item?.file_id || '',
                image_ori: {
                  height: undefined,
                  width: undefined,
                  url: item?.file_url,
                },
                image_thumb: {
                  height: undefined,
                  width: undefined,
                  url: item?.file_url,
                },
              },
              // @ts-expect-error -- linter-disable-autofix
              is_refer: item.is_refer || undefined,
            };
          }
          case 'file': {
            const { fileType = FileTypeEnum.DEFAULT_UNKNOWN } =
              // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
              getFileInfo(new File([], item?.name)) || {};
            return {
              type: ContentType.File,
              file: {
                file_key: item.file_id || '',

                // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
                file_name: item?.name,
                // @ts-expect-error -- linter-disable-autofix, 新添加参数，sdk中还未支持到
                file_size: item?.size,
                file_type: fileType,
                file_url: item?.file_url,
              },
              // @ts-expect-error -- linter-disable-autofix
              is_refer: item.is_refer || undefined,
            };
          }
          default: {
            return;
          }
        }
      })
      .filter(item => !!item);
    const contentResult = {
      item_list: itemList.filter(item => !item.is_refer),
      refer_items: itemList.filter(item => item.is_refer),
    };
    return JSON.stringify(contentResult);
  }
}
export const messageConverterToCoze = new MessageConverseToCoze();
