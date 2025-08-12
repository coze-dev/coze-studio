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

interface BusinessData<T> {
  code: number; // 0: success, others: error codes, business tidying
  data?: T;
  message?: string;
}
enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
}
interface MessageChannelEvent<T> {
  syncNo: number;
  type: MessageType;
  senderName?: string;
  toName?: string;
  eventName?: string;
  requestData?: unknown;
  respondData?: BusinessData<T>;
}
enum ErrorType {
  TIMEOUT = -1,
  UNKNOWN = -2,
}

type DestoryListenerFun = () => void;

const DEFAULT_TIMEOUT = 3000;

export class PostMessageChannel {
  private eventEmitter: EventEmitter = new EventEmitter();
  private syncEventId: number = Math.ceil(10000 * Math.random());
  private senderName = '';
  private toName?: string = '';
  private targetOrigin = '';
  private channelPort: Window;
  private onMessageFunc?: (event: MessageEvent) => void;

  public constructor({
    channelPort,
    senderName,
    toName,
    targetOrigin = '*',
  }: {
    channelPort: Window;
    senderName: string;
    toName?: string;
    targetOrigin?: string;
  }) {
    this.channelPort = channelPort;
    this.senderName = senderName;
    this.toName = toName;
    this.targetOrigin = targetOrigin;
    this.initListner();
  }

  public destory() {
    this.onMessageFunc &&
      window.removeEventListener('message', this.onMessageFunc);
    this.eventEmitter.removeAllListeners();
  }
  public async send<T1, T2>(
    eventName: string,
    data: T1,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<BusinessData<T2>> {
    const syncNo = this.syncEventId++;

    const messageEvent: MessageChannelEvent<T1> = {
      syncNo,
      type: MessageType.REQUEST,
      senderName: this.senderName,
      toName: this.toName,
      eventName,
      requestData: data,
    };
    this.channelPort.postMessage(messageEvent, this.targetOrigin);
    return await this.awaitRespond(syncNo, timeout);
  }
  public onRequest<T1, T2>(
    eventName: string,
    callback: (data: T1) => BusinessData<T2> | Promise<BusinessData<T2>>,
  ): DestoryListenerFun {
    const onHandle = async (event: MessageEvent) => {
      const messageEvent = event.data as MessageChannelEvent<unknown>;
      const result = await callback(messageEvent.requestData as T1);
      const responseMessageEvent: MessageChannelEvent<T2> = {
        syncNo: messageEvent.syncNo,
        type: MessageType.RESPONSE,
        toName: messageEvent.senderName || '',
        senderName: this.senderName,
        eventName,
        respondData: result,
      };
      if (event.source) {
        // @ts-expect-error -- linter-disable-autofix
        event.source.postMessage(responseMessageEvent, event.origin);
      } else {
        this.channelPort.postMessage(responseMessageEvent, this.targetOrigin);
      }
    };
    this.eventEmitter.on(`${MessageType.REQUEST}_${eventName}`, onHandle);
    return () => {
      this.eventEmitter.off(`${MessageType.REQUEST}_${eventName}`, onHandle);
    };
  }

  private initListner() {
    this.onMessageFunc = (event: MessageEvent) => {
      const messageEvent = event.data as MessageChannelEvent<unknown>;

      if (
        messageEvent.type === MessageType.RESPONSE &&
        this.senderName === messageEvent.toName
      ) {
        this.eventEmitter.emit(
          `${MessageType.RESPONSE}_${messageEvent.syncNo}`,
          messageEvent,
        );
      } else if (
        messageEvent.type === MessageType.REQUEST &&
        (!messageEvent.toName || this.senderName === messageEvent.toName)
      ) {
        this.eventEmitter.emit(
          `${MessageType.REQUEST}_${messageEvent.eventName}`,
          event,
        );
      }
    };
    window.addEventListener('message', this.onMessageFunc);
  }

  private awaitRespond<T>(syncNo: number, timeout): Promise<BusinessData<T>> {
    const eventName = `${MessageType.RESPONSE}_${syncNo}`;
    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        this.eventEmitter.emit(eventName, {
          respondData: {
            code: ErrorType.TIMEOUT,
            message: 'timeout',
          },
        });
      }, timeout);
      this.eventEmitter.once(
        eventName,
        (messageEvent: MessageChannelEvent<T>) => {
          clearTimeout(timeoutId);
          resolve(
            messageEvent.respondData || {
              code: ErrorType.UNKNOWN,
              message: 'unknow error',
            },
          );
        },
      );
    });
  }
}
