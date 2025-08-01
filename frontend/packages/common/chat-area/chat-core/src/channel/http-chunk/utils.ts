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
import { type FetchSteamConfig } from '@coze-arch/fetch-stream';

import { safeJSONParse } from '../../shared/utils/safe-json-parse';
import { type ChunkRaw } from '../../message/types';
import {
  type ParsedEvent,
  type ChannelEventMap,
  type MessageLifecycleCallbackParams,
} from './types';

export interface RetryCounterConfig {
  maxRetryAttempts?: number;
}

const defaultMaxRetryAttempts = 3;

export class RetryCounter {
  private attempts = 0;
  private maxRetryAttempts = 0;

  constructor(config?: RetryCounterConfig) {
    this.maxRetryAttempts = config?.maxRetryAttempts || defaultMaxRetryAttempts;
  }

  add = () => {
    this.attempts++;
  };
  reset = () => {
    this.attempts = 0;
  };

  matchMaxRetryAttempts = () => this.attempts >= this.maxRetryAttempts;
}

interface FetchDataHelperConstructor {
  localMessageID: string;
  retryCounterConfig?: RetryCounterConfig;
  totalFetchTimeout?: number;
  betweenChunkTimeout?: number;
  headers?: HeadersInit;
}

export class FetchDataHelper {
  abortSignal: AbortController;
  seqID?: number;
  retryCounter: RetryCounter;
  localMessageID: string;
  replyID?: string;
  logID?: string;
  totalFetchTimeout?: number;
  betweenChunkTimeout?: number;
  headers?: HeadersInit;

  constructor({
    localMessageID,
    retryCounterConfig,
    betweenChunkTimeout,
    totalFetchTimeout,
    headers,
  }: FetchDataHelperConstructor) {
    this.localMessageID = localMessageID;
    this.retryCounter = new RetryCounter(retryCounterConfig);
    this.abortSignal = new AbortController();
    this.betweenChunkTimeout = betweenChunkTimeout;
    this.totalFetchTimeout = totalFetchTimeout;
    this.headers = headers;
  }

  setReplyID = (id: string) => {
    this.replyID = id;
  };
  setSeqID = (id: number) => {
    this.seqID = id;
  };
  setLogID = (id?: string | null) => {
    if (!id) {
      return;
    }
    this.logID = id;
  };
}
export enum ChunkEvent {
  ERROR = 'error',
  DONE = 'done',
  MESSAGE = 'message',
}

export const streamParser: FetchSteamConfig<
  ParsedEvent,
  FetchDataHelper
>['streamParser'] = (parseEvent, { terminate }) => {
  const { type } = parseEvent;

  if (type === 'event') {
    const { data, event } = parseEvent;
    switch (event) {
      case ChunkEvent.MESSAGE:
        return {
          event,
          data: safeJSONParse<ChunkRaw>(data, null).value || undefined,
        };
      case ChunkEvent.DONE:
        terminate();
        return;
      // An exception occurs during the conversation, for example: the token is exhausted
      case ChunkEvent.ERROR:
        return { event, data };
      default:
        return;
    }
  }
};

export const getDataHelperPlaceholder = () =>
  new FetchDataHelper({
    localMessageID:
      'DataClamp placeholder, please check your HttpChunk Instance',
  });

export function inValidChunkRaw(value: unknown): value is ChunkRaw {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seq_id' in value &&
    'message' in value &&
    'is_finish' in value &&
    'seq_id' in value
  );
}

export class CustomEventEmitter extends EventEmitter {
  public customEmit<K extends keyof ChannelEventMap>(
    event: K,
    ...args: Parameters<ChannelEventMap[K]>
  ) {
    return super.emit(event, ...args);
  }
}

export const getMessageLifecycleCallbackParam = (
  dataClump: FetchDataHelper | undefined,
): MessageLifecycleCallbackParams => {
  const { localMessageID = '', replyID, logID } = dataClump ?? {};
  return {
    localMessageID,
    replyID,
    logID,
  };
};
