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

import { ContentType, type MessageContent } from '@coze-common/chat-core';
import { type ShortCutCommand } from '@coze-common/chat-area-plugins-chat-shortcuts';
import { type MixInitResponse, type ChatMessage } from '@coze-common/chat-area';
import {
  type EnterMessage,
  type RoleType,
  type ContentType as CozeApiContentType,
  type ObjectStringItem,
} from '@coze/api';

import { catchParse } from '@/util';
import { type OpenUserInfo } from '@/types/user';

class MessageConverterToSdk {
  public convertRequestBody({
    body,
    userInfo,
    connectorId,
    parameters,
    shortcuts,
  }: {
    body: string;
    userInfo?: OpenUserInfo;
    connectorId?: string;
    parameters?: Record<string, unknown>;
    shortcuts?: ShortCutCommand[];
  }): string {
    const messageBody: Record<string, string> = catchParse(body) || {};
    const contentType = messageBody.content_type as ContentType;
    const content = messageBody.query as string;
    const shortcutCommand = messageBody.shortcut_command as string;
    return JSON.stringify({
      bot_id: messageBody.bot_id,
      user_id: userInfo?.id,
      stream: true,
      connector_id: connectorId,
      additional_messages: [this.convertRequestMessage(contentType, content)],
      parameters,
      shortcut_command: this.convertShortcuts(shortcuts || [], shortcutCommand),
      enable_card: true,
    });
  }
  // 替换 chat请求中的 message部分
  private convertRequestMessage(contentType: ContentType, content: string) {
    return {
      role: 'user',
      ...this.convertContent(contentType, content),
    };
  }
  private convertContent(
    contentType: ContentType,
    content: string,
    isNeedFileUrl = false,
  ) {
    switch (contentType) {
      case ContentType.Text:
        return {
          content_type: 'text',
          content,
        };
      case ContentType.Card:
        return {
          content_type: 'card',
          content,
        };
      case ContentType.Image:
      case ContentType.File:
      case ContentType.Mix: {
        return this.convertMixContent(content, isNeedFileUrl);
      }
      default: {
        throw new Error('Error: unknown content Type');
      }
    }
  }
  private convertMixContent(content: string, isNeedFileUrl = false) {
    const contentObj = catchParse(content) as MessageContent<ContentType.Mix> &
      MessageContent<ContentType.File> &
      MessageContent<ContentType.Image>;
    if (!contentObj) {
      return;
    }
    let mixObjectList: MessageContent<ContentType.Mix>['item_list'] = [
      ...(contentObj?.item_list || []),
    ];
    const mixReferObjectList: MessageContent<ContentType.Mix>['item_list'] = [
      // @ts-expect-error -- linter-disable-autofix
      ...(contentObj?.refer_items || []),
    ];
    mixObjectList = mixObjectList.concat(
      (contentObj?.image_list || []).map(item => ({
        type: ContentType.Image,
        image: item,
      })),
    );
    mixObjectList = mixObjectList.concat(
      (contentObj?.file_list || []).map(item => ({
        type: ContentType.File,
        file: item,
      })),
    );
    mixObjectList = mixObjectList.concat(
      (mixReferObjectList || []).map(item => ({
        ...item,
        is_refer: true,
      })),
    );

    return {
      content_type: 'object_string',
      content: JSON.stringify(
        mixObjectList
          .map(item => {
            switch (item.type) {
              case ContentType.Text:
                return {
                  type: 'text',
                  text: item.text,
                  // @ts-expect-error -- linter-disable-autofix
                  is_refer: item.is_refer || undefined,
                };
              case ContentType.Image: {
                return {
                  type: 'image',
                  file_id: item.image.key,
                  file_url:
                    isNeedFileUrl || !item.image.key
                      ? item.image.image_ori?.url
                      : undefined,
                  // @ts-expect-error -- linter-disable-autofix
                  is_refer: item.is_refer || undefined,
                };
              }
              case ContentType.File: {
                return {
                  type: 'file',
                  file_id: item.file.file_key || !item.file.file_key,
                  file_url: isNeedFileUrl ? item.file?.file_url : undefined,
                  // @ts-expect-error -- linter-disable-autofix
                  is_refer: item.is_refer || undefined,
                };
              }
              default: {
                return null;
              }
            }
          })
          .filter(item => !!item),
      ),
    };
  }
  public convertMessageListResponse(
    messageList: MixInitResponse['messageList'],
  ) {
    return messageList
      ?.reverse()
      .map(item => {
        const cozeMessage = this.convertMessage(item);
        //(alias) type CozeApiContentType = "text" | "card" | "object_string"

        if (cozeMessage?.content_type === 'object_string') {
          const contentObj = catchParse(
            cozeMessage.content as unknown as string,
          ) as ObjectStringItem[];
          const contentTemp = contentObj?.map(item2 => {
            if (item2.type === 'image' || item2.type === 'file') {
              return {
                type: 'text',
                text: item2.file_url,
              };
            }
            return item2;
          });
          if (contentTemp?.length === 1 && contentTemp[0]?.type === 'text') {
            cozeMessage.content_type = 'text' as CozeApiContentType;
            cozeMessage.content = contentTemp[0].text;
          } else if (contentTemp?.length > 0) {
            cozeMessage.content = JSON.stringify(contentTemp);
          } else {
            return null;
          }
        }
        return cozeMessage;
      })
      .filter(item => !!item);
  }
  private convertMessage(message: ChatMessage): EnterMessage | null {
    if (
      message.type &&
      ['ack', 'answer', 'question'].includes(message.type) &&
      message.role &&
      ['user', 'assistant'].includes(message.role) &&
      message.content_type &&
      ['card', 'image', 'text', 'object_string', 'file'].includes(
        message.content_type,
      ) &&
      message.content
    ) {
      // @ts-expect-error -- linter-disable-autofix
      const sdkMessage: EnterMessage = {
        role: message.role as RoleType,
        ...this.convertContent(
          message.content_type as ContentType,
          message.content || '',
          true,
        ),
      };
      return sdkMessage;
    }
    return null;
  }
  private convertShortcuts(
    shortcuts: ShortCutCommand[],
    commandStr:
      | string
      | {
          command_id: string;
          parameters: Record<string, unknown>;
        },
  ) {
    let command;
    if (typeof commandStr === 'string') {
      command = catchParse(commandStr);
    } else if (typeof commandStr === 'object') {
      command = commandStr;
    } else {
      return commandStr;
    }
    const currentShortcut = shortcuts.find(
      item => item.command_id === command.command_id,
    );

    if (currentShortcut?.components_list) {
      const toolParameterMap = new Map(
        currentShortcut.components_list
          .filter(c => c.parameter && c.name)
          .map(c => [c.parameter, c.name]),
      );

      Object.keys(command.parameters).forEach(key => {
        const compName = toolParameterMap.get(key);
        const val = command.parameters[key];
        if (compName) {
          delete command.parameters[key];
          command.parameters[compName] = val;
        }
      });
    }

    return command;
  }
}
export const messageConverterToSdk = new MessageConverterToSdk();
