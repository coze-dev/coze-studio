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

import { BETWEEN_CHUNK_TIMEOUT, SEND_MESSAGE_TIMEOUT } from '@/shared/const';
import { RequestScene } from '@/request-manager/types';
import { type ReportLog } from '@/report-log';
import {
  PreSendLocalMessageEventsEnum,
  type SendMessage,
  type SendMessageMergedOptions,
  type SendMessageOptions,
  ContentType,
  type Message,
} from '@/message/types';
import { type PreSendLocalMessageEventsManager } from '@/message/presend-local-message/presend-local-message-events-manager';
import {
  type PreSendLocalMessage,
  type PreSendLocalMessageFactory,
} from '@/message';
import { ChatCoreError } from '@/custom-error';
import { type HttpChunk } from '@/channel/http-chunk';

import {
  type ReportEventsTracer,
  SlardarEvents,
} from '../events/slardar-events';

export interface SendMessageServicesProps {
  preSendLocalMessageFactory: PreSendLocalMessageFactory;
  httpChunk: HttpChunk;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  reportLogWithScope: ReportLog;
  reportEventsTracer: ReportEventsTracer;
}
export class SendMessageService {
  preSendLocalMessageFactory: PreSendLocalMessageFactory;
  httpChunk: HttpChunk;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  reportLogWithScope: ReportLog;
  reportEventsTracer: ReportEventsTracer;
  constructor({
    preSendLocalMessageFactory,
    httpChunk,
    preSendLocalMessageEventsManager,
    reportLogWithScope,
    reportEventsTracer,
  }: SendMessageServicesProps) {
    this.preSendLocalMessageFactory = preSendLocalMessageFactory;
    this.httpChunk = httpChunk;
    this.preSendLocalMessageEventsManager = preSendLocalMessageEventsManager;
    this.reportLogWithScope = reportLogWithScope;
    this.reportEventsTracer = reportEventsTracer;
  }

  /**
   * Send resume message
   */
  resumeMessage(message: Message<ContentType>, options?: SendMessageOptions) {
    const mergedOptions: SendMessageMergedOptions = {
      sendTimeout: SEND_MESSAGE_TIMEOUT,
      betweenChunkTimeout: BETWEEN_CHUNK_TIMEOUT,
      stream: true,
      chatHistory: [],
      isRegenMessage: false,
      ...options,
    };

    const exposedMessage =
      this.preSendLocalMessageFactory.getSendMessageStructure(
        message,
        mergedOptions,
      );

    this.httpChunk.sendMessage(exposedMessage, {
      betweenChunkTimeout: options?.betweenChunkTimeout,
      headers: options?.headers,
      requestScene: RequestScene.ResumeMessage,
    });
  }

  /**
   * Send message
   */
  async sendMessage(
    message: Message<ContentType>,
    options?: SendMessageOptions,
  ): Promise<Message<ContentType>> {
    const mergedOptions: SendMessageMergedOptions = {
      sendTimeout: SEND_MESSAGE_TIMEOUT,
      betweenChunkTimeout: BETWEEN_CHUNK_TIMEOUT,
      stream: true,
      chatHistory: [],
      isRegenMessage: false,
      ...options,
    };
    this.reportLogWithScope.info({
      message: '开始发送消息',
      meta: {
        message,
      },
    });

    if (message.content_type === ContentType.Image) {
      return await this.sendImageMessage(
        message as PreSendLocalMessage<ContentType.Image>,
        mergedOptions,
      );
    }

    if (message.content_type === ContentType.File) {
      return await this.sendFileMessage(
        message as PreSendLocalMessage<ContentType.File>,
        mergedOptions,
      );
    }

    return await this.sendTextMessage(
      message as PreSendLocalMessage<ContentType.Text>,
      mergedOptions,
    );
  }

  /**
   * Send picture message
   */
  private async sendImageMessage(
    message: PreSendLocalMessage<ContentType.Image>,
    options: SendMessageMergedOptions,
  ) {
    const uploadMessage = await this.onUploadEventFinish(message, options);
    const exposedMessage =
      this.preSendLocalMessageFactory.getSendMessageStructure(
        uploadMessage,
        options,
      );
    return await this.sendChannelMessage(exposedMessage, options);
  }

  /**
   * Send file message
   * @param message
   * @param options
   * @private
   */
  private async sendFileMessage(
    message: PreSendLocalMessage<ContentType.File>,
    options: SendMessageMergedOptions,
  ) {
    const uploadMessage = await this.onUploadEventFinish(message, options);
    const exposedMessage =
      this.preSendLocalMessageFactory.getSendMessageStructure(
        uploadMessage,
        options,
      );
    return await this.sendChannelMessage(exposedMessage, options);
  }

  /**
   * Send a text message
   */
  private async sendTextMessage(
    message: PreSendLocalMessage<ContentType.Text>,
    options: SendMessageMergedOptions,
  ) {
    const exposedMessage =
      this.preSendLocalMessageFactory.getSendMessageStructure(message, options);
    return await this.sendChannelMessage(exposedMessage, options);
  }

  /**
   * Upload image & file upload event complete
   */
  private onUploadEventFinish<T extends ContentType.Image | ContentType.File>(
    message: PreSendLocalMessage<T>,
    sendMessageOptions?: SendMessageOptions,
  ): Promise<PreSendLocalMessage<T>> {
    return new Promise((resolve, reject) => {
      // If it is to regenerate the message, return it directly.
      if (sendMessageOptions?.isRegenMessage) {
        resolve(message);
        return;
      }
      // According to message_id, check whether the upload has been completed
      const stashedLocalMessage =
        this.preSendLocalMessageEventsManager.getStashedLocalMessage(
          message.extra_info.local_message_id,
        ) as PreSendLocalMessage<T>;
      if (stashedLocalMessage?.file_upload_result) {
        if (stashedLocalMessage?.file_upload_result === 'success') {
          // Todo is changed to directly resolve message, stashed should not be stored in the full amount of requests, which is easy to cause misunderstandings
          resolve(message);
          return;
        }
        this.reportLogWithScope.slardarEvent({
          eventName: SlardarEvents.SDK_MESSAGE_UPLOAD_FAIL,
          meta: {
            message: '图片上传失败',
          },
        });
        reject(new Error('图片上传失败'));
        return;
      }

      // Message upload complete
      this.preSendLocalMessageEventsManager.on(
        PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
        (preSendLocalMessage: Message<ContentType>) => {
          if (
            preSendLocalMessage.extra_info.local_message_id !==
            message.extra_info.local_message_id
          ) {
            return;
          }
          if (preSendLocalMessage.file_upload_result === 'success') {
            resolve(preSendLocalMessage as PreSendLocalMessage<T>);
          } else {
            this.reportLogWithScope.slardarEvent({
              eventName: SlardarEvents.SDK_MESSAGE_UPLOAD_FAIL,
              meta: {
                message: '图片上传失败-fail',
              },
            });
            reject(new Error('图片上传失败'));
          }
        },
      );
    });
  }

  /**
   * HttpChunk send message event mode changed to await mode
   * @Param message The final message format to be sent to the server
   * @Param options send message configuration
   */
  private sendChannelMessage(
    message: SendMessage,
    options: SendMessageMergedOptions,
  ): Promise<Message<ContentType>> {
    const { sendTimeout, betweenChunkTimeout, headers } = options;
    const { local_message_id } = message;

    return new Promise((resolve, reject) => {
      let isHandled = false;
      const timer = setTimeout(() => {
        if (isHandled) {
          return;
        }
        isHandled = true;
        this.preSendLocalMessageEventsManager.updateLocalMessageStatus(
          message.local_message_id,
          'send_timeout',
        );
        this.reportEventsTracer?.sendMessageTracer.timeout(local_message_id);
        this.preSendLocalMessageEventsManager.emit(
          PreSendLocalMessageEventsEnum.MESSAGE_SEND_TIMEOUT,
          new ChatCoreError('消息发送超时', {
            local_message_id: message.local_message_id,
          }),
        );
        reject(
          new ChatCoreError('消息发送超时', {
            local_message_id: message.local_message_id,
          }),
        );
      }, sendTimeout);
      this.reportEventsTracer?.sendMessageTracer.start(local_message_id);
      this.httpChunk.sendMessage(message, {
        betweenChunkTimeout,
        headers,
        requestScene: RequestScene.SendMessage,
      });
      // The monitor message was sent successfully.
      this.preSendLocalMessageEventsManager.once(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS,
        (receiveMessage: Message<ContentType>) => {
          if (
            receiveMessage.extra_info.local_message_id !==
            message.local_message_id
          ) {
            return;
          }
          if (isHandled) {
            return;
          }
          isHandled = true;
          clearTimeout(timer);
          this.preSendLocalMessageEventsManager.updateLocalMessageStatus(
            receiveMessage.extra_info.local_message_id,
            'send_success',
          );
          this.reportEventsTracer?.sendMessageTracer.success(local_message_id, {
            logId: receiveMessage.logId,
          });
          resolve(receiveMessage);
        },
      );
      // Listening message sending failed
      this.preSendLocalMessageEventsManager.once(
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
        (error: ChatCoreError) => {
          if (error.ext.local_message_id !== message.local_message_id) {
            return;
          }
          if (isHandled) {
            return;
          }
          isHandled = true;
          clearTimeout(timer);
          this.preSendLocalMessageEventsManager.updateLocalMessageStatus(
            error.ext.local_message_id,
            'send_fail',
          );
          this.reportEventsTracer?.sendMessageTracer.error(error);
          reject(error);
        },
      );
    });
  }
}
