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

import EventEmitter from 'eventemitter3';

import {
  type PreSendLocalMessageEventsMap,
  type ContentType,
  type Message,
  PreSendLocalMessageEventsEnum,
  type LocalMessageStatus,
} from '../types';
import { type ReportLog } from '../../report-log';
import { type ChatCoreError } from '../../custom-error';
import { type PreSendLocalMessage } from './presend-local-message';

export interface PreSendLocalMessageEventsManagerProps {
  reportLog: ReportLog;
}

/**
 * Mainly handles state management of pre-sent messages
 */
export class PreSendLocalMessageEventsManager {
  private reportLog: ReportLog;

  private reportLogWithScope: ReportLog;

  constructor(props: PreSendLocalMessageEventsManagerProps) {
    this.reportLog = props.reportLog;
    this.reportLogWithScope = this.reportLog.createLoggerWith({
      scope: 'preSendLocalMessageEventsManager',
    });
    this.preSendLocalMessageEventsMap = new Map();
  }

  private preSendLocalMessageEvents: EventEmitter<PreSendLocalMessageEventsEnum> =
    new EventEmitter();

  private preSendLocalMessageEventsMap: Map<
    string,
    PreSendLocalMessage<ContentType>
  > = new Map();

  // Add local messages that need to be cached
  add(message: Message<ContentType>) {
    this.preSendLocalMessageEventsMap.set(
      message.extra_info.local_message_id,
      message,
    );
    this.reportLogWithScope.info({
      message: '本地消息缓存-新增',
      meta: {
        buffer: this.preSendLocalMessageEventsMap,
      },
    });
  }

  updateLocalMessageStatus(
    local_message_id: string,
    local_message_status: LocalMessageStatus,
  ) {
    const message = this.preSendLocalMessageEventsMap.get(local_message_id);
    if (message) {
      message.local_message_status = local_message_status;
      this.preSendLocalMessageEventsMap.set(local_message_id, message);
      this.reportLogWithScope.info({
        message: '本地消息缓存-更新消息状态',
        meta: {
          buffer: this.preSendLocalMessageEventsMap,
          local_message_status,
        },
      });
    }
  }

  // Get cached local messages
  getStashedLocalMessage(local_message_id: string) {
    return this.preSendLocalMessageEventsMap.get(local_message_id);
  }

  on<T extends PreSendLocalMessageEventsEnum>(
    event: T,
    callback: PreSendLocalMessageEventsMap[T],
  ) {
    this.preSendLocalMessageEvents.on(event, callback);
  }

  once<T extends PreSendLocalMessageEventsEnum>(
    event: T,
    callback: PreSendLocalMessageEventsMap[T],
  ) {
    this.preSendLocalMessageEvents.once(event, callback);
  }

  emit<T extends PreSendLocalMessageEventsEnum>(
    event: T,
    params: Parameters<PreSendLocalMessageEventsMap[T]>[0],
  ) {
    this.preSendLocalMessageEvents.emit(event, params);
    // Sent successfully, clear
    if (event === PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS) {
      const message = params as Message<ContentType>;
      this.preSendLocalMessageEventsMap.delete(
        message.extra_info.local_message_id,
      );
      this.reportLogWithScope.info({
        message: '本地消息缓存清除-发送成功',
        meta: {
          buffer: this.preSendLocalMessageEventsMap,
        },
      });
      return;
    }

    // Send failed/timed out, clear
    if (
      [
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL,
        PreSendLocalMessageEventsEnum.MESSAGE_SEND_TIMEOUT,
      ].includes(event)
    ) {
      const { local_message_id } = (params as ChatCoreError).ext;
      local_message_id &&
        this.preSendLocalMessageEventsMap.delete(local_message_id);
      this.reportLogWithScope.info({
        message: '本地消息缓存清除-发送失败/超时',
        meta: {
          buffer: this.preSendLocalMessageEventsMap,
        },
      });
      return;
    }

    // Upload status modification
    if (event === PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE) {
      const message = params as Message<ContentType>;
      this.preSendLocalMessageEventsMap.set(
        message.extra_info.local_message_id,
        message,
      );
    }
  }

  /**
   * destroy
   */
  destroy() {
    this.preSendLocalMessageEvents.removeAllListeners();
    this.preSendLocalMessageEventsMap.clear();
  }
}
