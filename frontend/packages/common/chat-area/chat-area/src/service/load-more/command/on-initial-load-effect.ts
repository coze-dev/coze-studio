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
 
import { compute } from '@coze-common/chat-area-utils';

import {
  LoadAsyncEffect,
  type LoadCommandEnvTools,
  LoadEffect,
} from '../load-command';
import { type Message } from '../../../store/types';
import { getIsValidMessageIndex } from '../../../store/action-implement/messages/get-message-index-range';
import { ReportErrorEventNames } from '../../../report-events/report-event-names';
import { type MixInitResponse } from '../../../context/chat-area-context/type';

export interface LocateUnreadMessageParam {
  messages: Pick<Partial<Message>, 'message_index' | 'message_id'>[];
  readIndex?: string;
}

export class OnInitialLoadEffect extends LoadAsyncEffect {
  constructor(
    envTools: LoadCommandEnvTools,
    private data: MixInitResponse,
  ) {
    super(envTools);
  }
  /**
   * 录入数据
   * 刷一次 index 数据
   * 刷吧刷吧
   * 后端又不加字段
   * 不刷怎么办
   */
  async runAsync() {
    const { data, envTools } = this;
    const { messageIndexHelper } = envTools;
    // DO NOT await !
    messageIndexHelper.recordFirstLoadAndRefreshIndex(data);
    return new Promise<void>(resolve =>
      envTools.waitMessagesLengthChangeLayoutEffect(() => {
        new InitialLoadLocating(envTools, {
          readIndex: data.read_message_index,
          messages: data.messageList || [],
        }).run();
        resolve();
      }),
    );
  }
}

export class InitialLoadLocating extends LoadEffect {
  constructor(
    envTools: LoadCommandEnvTools,
    private data: LocateUnreadMessageParam,
  ) {
    super(envTools);
  }

  run() {
    const { enableMarkRead } = this.envTools.readEnvValues();
    if (!enableMarkRead) {
      return;
    }
    this.locateUnreadMessage(this.data);
  }

  private locateUnreadMessage(param: LocateUnreadMessageParam) {
    const { readIndex } = param;
    if (!getIsValidMessageIndex(readIndex)) {
      return;
    }
    if (!param.messages.length) {
      return;
    }
    const { reporter } = this.envTools;
    const targetMessageBox = this.getNextReadMessageDom({
      readIndex,
      messages: param.messages,
    });
    if (!targetMessageBox) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadInitialGetUnreadMessageIdFail,
        error: new Error(`fail to get targetMessageBox of: ${readIndex}`),
      });
      return;
    }
    targetMessageBox.scrollIntoView();
  }

  /**
   * 尝试找 read message index 对应的消息，
   * 找不到就用当前的
   */
  private getNextReadMessageDom({
    messages,
    readIndex,
  }: Required<LocateUnreadMessageParam>): Element | null {
    const { reporter } = this.envTools;
    const nextReadIndex = compute(readIndex).next();
    const messageIds: (string | undefined)[] = [];
    for (const msg of messages || []) {
      const index = msg.message_index;
      if (index === nextReadIndex) {
        messageIds[0] = msg.message_id;
      }
      if (index === readIndex) {
        messageIds[1] = msg.message_id;
      }
      if (messageIds[0] && messageIds[1]) {
        break;
      }
    }
    if (!messageIds[0] && !messageIds[1]) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadInitialGetReadMessageFail,
        error: new Error(`read_message_index: ${readIndex}`),
      });
      return null;
    }
    for (const id of messageIds) {
      const selector = `[data-message-id="${id}"]`;
      const targetDom = document.querySelector(selector);
      if (targetDom) {
        return targetDom;
      }
    }
    return null;
  }
}
