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
 
/**
 * 消息管理相关
 * 1、获取历史消息
 * 2、清空对话上下文
 * 3、清空历史
 * 4、删除消息
 */

import { safeJSONParse } from '../shared/utils/safe-json-parse';
import { RequestScene } from '../request-manager/types';
import { type RequestManager } from '../request-manager';
import type { ReportLog } from '../report-log';
import {
  type ReportMessageProps,
  type BreakMessageProps,
  type BreakMessageResponse,
  type ClearHistoryProps,
  type ClearHistoryResponse,
  type ClearMessageContextProps,
  type DeleteMessageProps,
  type DeleteMessageResponse,
  type GetHistoryMessageProps,
  type GetHistoryMessageResponse,
  type ReportMessageResponse,
  type ClearMessageContextResponse,
  type ChatASRProps,
  type ChatASRResponse,
} from './types/message-manager';
import { ContentType, type MessageContent } from './types';
import { SlardarEvents } from './events/slardar-events';

export interface MessageManagerProps {
  reportLog: ReportLog;
  requestManager: RequestManager;
}

export class MessageManager {
  reportLog: ReportLog;

  reportLogWithScope: ReportLog;

  requestManager: RequestManager;

  request: RequestManager['request'];

  constructor(props: MessageManagerProps) {
    const { reportLog, requestManager } = props;
    this.reportLog = reportLog;
    this.requestManager = requestManager;
    this.request = requestManager.request;
    this.reportLogWithScope = this.reportLog.createLoggerWith({
      scope: 'message',
    });
  }

  /**
   * 将接口获取到的消息历史记录进行数据转换
   */
  static convertMessageList = (
    messageList: GetHistoryMessageResponse['message_list'],
  ) => {
    messageList.forEach(message => {
      message.content_obj =
        message.content_type === ContentType.Text
          ? undefined
          : safeJSONParse<MessageContent<ContentType>>(message.content, null)
              .value;
    });
    return messageList;
  };

  /**
   * 获取历史消息
   */
  async getHistoryMessage(props: GetHistoryMessageProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.GetMessage).url,
        props,
      );
      const data = res.data as GetHistoryMessageResponse;
      data.message_list = MessageManager.convertMessageList(data.message_list);
      return data;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_FETCH_HISTORY_ERROR,
        error: error as Error,
      });
      // 此处不应省略异常抛出，上游逻辑分支已检查，无风险
      throw error;
    }
  }

  /**
   * 清空对话上下文
   */
  async clearMessageContextUrl(props: ClearMessageContextProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.ClearMessageContext)
          .url,
        props,
      );
      return res.data as ClearMessageContextResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_CLEAR_CONTEXT_ERROR,
        error: error as Error,
      });
    }
  }

  /**
   * 清空历史
   */
  async clearHistory(props: ClearHistoryProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.ClearHistory).url,
        props,
      );
      return res.data as ClearHistoryResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_CLEAR_HISTORY_ERROR,
        error: error as Error,
      });
    }
  }

  /**
   * 删除消息
   */
  async deleteMessage(props: DeleteMessageProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.DeleteMessage).url,
        props,
      );
      return res.data as DeleteMessageResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_DELETE_ERROR,
        error: error as Error,
      });
    }
  }

  /**
   * 打断消息
   */
  async breakMessage(props: BreakMessageProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.BreakMessage).url,
        props,
      );
      return res.data as BreakMessageResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_INTERRUPT_ERROR,
        error: error as Error,
      });
    }
  }

  /**
   * 点赞/点踩消息
   */
  async reportMessage(props: ReportMessageProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.ReportMessage).url,
        props,
      );
      return res.data as ReportMessageResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.MESSAGE_REPORT_ERROR,
        error: error as Error,
      });
    }
  }

  /**
   * 语音转文字
   */
  async chatASR(props: ChatASRProps) {
    try {
      const res = await this.request.post(
        this.requestManager.getSceneConfig(RequestScene.ChatASR).url,
        props,
        {
          headers: {
            /**
             * https://developer.mozilla.org/zh-CN/docs/Web/API/FormData
             * 如果送出时的编码类型被设为 "multipart/form-data"，它会使用和表单一样的格式。
             */
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data as ChatASRResponse;
    } catch (error) {
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.CHAT_ASR_ERROR,
        error: error as Error,
      });
      throw error;
    }
  }
}
