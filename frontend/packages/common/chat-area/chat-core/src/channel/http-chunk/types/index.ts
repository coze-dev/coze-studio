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
  type FetchSteamConfig,
  FetchStreamErrorCode,
} from '@coze-arch/fetch-stream';

import { type FetchDataHelper } from '../utils';
import { type HttpChunkEvents } from '../events/http-chunk-events';
import { type RequestScene } from '../../../request-manager/types';
import { type ChunkRaw } from '../../../message/types';

export { FetchStreamErrorCode };

export interface HttpChunkMessageInvalidErrorInfo {
  replyID?: string;
  logID?: string;
}

export interface ErrorInfo {
  msg: string;
  code: FetchStreamErrorCode | number;
  error?: unknown;
  ext?: {
    localMessageID?: string;
    logID?: string;
    replyID?: string;
  };
}

export interface OnMessageCallbackParams {
  chunk: ChunkRaw;
  logID?: string;
  replyID?: string;
}

export interface MessageLifecycleCallbackParams
  extends Pick<OnMessageCallbackParams, 'logID' | 'replyID'> {
  localMessageID: string;
}

export type OnMessageCallback = (messageEvent: OnMessageCallbackParams) => void;
/**
 * The received message structure responded abnormally to this error
 */
export type OnMessageInvalidCallback = (
  error: HttpChunkMessageInvalidErrorInfo,
) => void;
export type OnMessageSuccessCallback = (
  params: MessageLifecycleCallbackParams,
) => void;
export type OnMessageStartCallback = (
  params: MessageLifecycleCallbackParams,
) => void;

/**
 * HttpChunk failed to connect, accidentally disconnected, aborted
 */
export type OnErrorCallback = (errorInfo: ErrorInfo) => void;

export type OnMessageTimeoutCallback = (
  params: MessageLifecycleCallbackParams,
) => void;

export type SendMessageConfig = Pick<
  FetchSteamConfig,
  'betweenChunkTimeout' | 'totalFetchTimeout' | 'headers'
> & { requestScene?: RequestScene };

export interface ChannelEventMap {
  [HttpChunkEvents.MESSAGE_RECEIVED]: OnMessageCallback;
  [HttpChunkEvents.BETWEEN_CHUNK_TIMEOUT]: OnMessageTimeoutCallback;
  [HttpChunkEvents.TOTAL_FETCH_TIMEOUT]: OnMessageTimeoutCallback;
  [HttpChunkEvents.FETCH_SUCCESS]: OnMessageSuccessCallback;
  [HttpChunkEvents.FETCH_START]: OnMessageStartCallback;
  [HttpChunkEvents.FETCH_ERROR]: OnErrorCallback;
  [HttpChunkEvents.INVALID_MESSAGE]: OnMessageInvalidCallback;
  [HttpChunkEvents.READ_STREAM_START]: OnMessageStartCallback;
  [HttpChunkEvents.READ_STREAM_ERROR]: OnErrorCallback;
  [HttpChunkEvents.ALL_SUCCESS]: OnMessageSuccessCallback;
}

export interface HandleMessageParams {
  message: ParsedEvent;
  fetchDataHelper?: FetchDataHelper;
}

export interface HandleErrorParams {
  errorInfo: ErrorInfo;
  fetchDataHelper?: FetchDataHelper;
}

export interface HandleMessageSuccessParams {
  fetchDataHelper?: FetchDataHelper;
}

export interface HandleMessageTimerEndParams {
  fetchDataHelper?: FetchDataHelper;
}

export interface HandleMessageTimerEndParams {
  fetchDataHelper?: FetchDataHelper;
}

export interface ParsedEvent {
  event: string;
  data: ChunkRaw | string | undefined;
}
