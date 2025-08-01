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

import { FetchStreamErrorCode, fetchStream } from '@coze-arch/fetch-stream';

import { ABORT_HTTP_CHUNK_MESSAGE } from '../constant';
import { RequestScene } from '../../request-manager/types';
import { type RequestManager } from '../../request-manager';
import { type ReportLog } from '../../report-log';
import { type SendMessage } from '../../message/types';
import { ChatCoreError } from '../../custom-error';
import { type TokenManager } from '../../credential';
import {
  CustomEventEmitter,
  FetchDataHelper,
  getDataHelperPlaceholder,
  getMessageLifecycleCallbackParam,
  inValidChunkRaw,
  type RetryCounterConfig,
  streamParser,
  ChunkEvent,
} from './utils';
import {
  type ParsedEvent,
  type HandleErrorParams,
  type HandleMessageParams,
  type HandleMessageSuccessParams,
  type HandleMessageTimerEndParams,
  type SendMessageConfig,
} from './types';
import { SlardarEvents } from './events/slardar-events';
import { HttpChunkEvents } from './events/http-chunk-events';

interface HttpChunkAdaptorConfig {
  retryCounterConfig?: RetryCounterConfig;
  requestManager: RequestManager;
  tokenManager?: TokenManager;
  reportLogWithScope: ReportLog;
}

const MAX_DATA_HELPERS = 100;

export class HttpChunk extends CustomEventEmitter {
  readonly retryCounterConfig?: RetryCounterConfig;
  private fetchDataHelperMap: Map<string, FetchDataHelper>;
  private requestManager: RequestManager;
  private tokenManager?: TokenManager;
  private reportLogWithScope: ReportLog;
  constructor({
    retryCounterConfig,
    requestManager,
    tokenManager,
    reportLogWithScope,
  }: HttpChunkAdaptorConfig) {
    super();
    this.retryCounterConfig = retryCounterConfig;
    this.fetchDataHelperMap = new Map();
    this.requestManager = requestManager;
    this.tokenManager = tokenManager;
    this.reportLogWithScope = reportLogWithScope;
  }

  private handleMessageSuccess = ({
    fetchDataHelper = getDataHelperPlaceholder(),
  }: HandleMessageSuccessParams) => {
    const { localMessageID } = fetchDataHelper;

    this.fetchDataHelperMap.delete(localMessageID);

    this.customEmit(
      HttpChunkEvents.ALL_SUCCESS,
      getMessageLifecycleCallbackParam(fetchDataHelper),
    );
  };

  private handleMessage = ({
    message: { data },
    fetchDataHelper = getDataHelperPlaceholder(),
  }: HandleMessageParams) => {
    const { logID, replyID } = fetchDataHelper;

    // The data type thrown from fetch is obtained by assertions, here the runtime defends the type
    if (!inValidChunkRaw(data)) {
      this.customEmit(HttpChunkEvents.INVALID_MESSAGE, {
        logID,
        replyID,
      });

      return;
    }
    const validChunk = data;
    fetchDataHelper.setReplyID(validChunk.message.reply_id);
    this.customEmit(HttpChunkEvents.MESSAGE_RECEIVED, {
      chunk: validChunk,
      logID,
    });
  };

  private pullMessage = async ({
    value,
    // TODO: There is no message retry in this issue
    isRePullMessage: _isRePullMessage,
    fetchDataHelper,
    fetchUrl,
    scene,
  }: {
    value: Record<string, unknown>; // Short URL imported parameters: direct pass-through body does not do specialized processing, external processing business logic
    isRePullMessage: boolean;
    fetchDataHelper: FetchDataHelper;
    fetchUrl: string; // Short URL Link
    scene: RequestScene;
  }) => {
    // TODO: hzf, does not use ternary expressions
    const headers: [string, string][] = [
      ['content-type', 'application/json'],
      ...((this.tokenManager?.getApiKeyAuthorizationValue()
        ? [['Authorization', this.tokenManager.getApiKeyAuthorizationValue()]]
        : []) as [string, string][]),
      ...(fetchDataHelper.headers
        ? Array.isArray(fetchDataHelper.headers)
          ? fetchDataHelper.headers
          : Object.entries(fetchDataHelper.headers)
        : []),
    ];
    const { hooks } = this.requestManager.getSceneConfig?.(scene) || {};
    const { onBeforeSendMessage = [], onGetMessageStreamParser } = hooks || {};

    // The following parameters can be modified
    let channelFetchInfo = {
      url: fetchUrl,
      body: JSON.stringify(value),
      headers,
      method: 'POST',
    };

    for (const hook of onBeforeSendMessage) {
      channelFetchInfo = await hook(channelFetchInfo);
    }
    await fetchStream<ParsedEvent, FetchDataHelper>(channelFetchInfo.url, {
      onStart: response => {
        fetchDataHelper.setLogID(response.headers.get('x-tt-logid'));

        return Promise.resolve();
      },
      onFetchStart: localeData => {
        this.customEmit(
          HttpChunkEvents.FETCH_START,
          getMessageLifecycleCallbackParam(localeData),
        );
      },
      onFetchSuccess: localeData => {
        this.customEmit(
          HttpChunkEvents.FETCH_SUCCESS,
          getMessageLifecycleCallbackParam(localeData),
        );
      },
      onStartReadStream: localeData => {
        this.customEmit(
          HttpChunkEvents.READ_STREAM_START,
          getMessageLifecycleCallbackParam(localeData),
        );
      },
      onError: ({ fetchStreamError, dataClump: localeData }) =>
        this.handleError({
          errorInfo: {
            ...fetchStreamError,
            ext: getMessageLifecycleCallbackParam(localeData),
          },
          fetchDataHelper: localeData,
        }),
      onAllSuccess: localClump =>
        this.handleMessageSuccess({ fetchDataHelper: localClump }),
      validateMessage: ({ message }) => {
        if (message.event !== ChunkEvent.ERROR) {
          return {
            status: 'success',
          };
        }
        return {
          error: new Error(String(message.data)),
          status: 'error',
        };
      },
      onMessage: ({ message, dataClump }) =>
        this.handleMessage({ message, fetchDataHelper: dataClump }),
      streamParser: onGetMessageStreamParser?.(value) || streamParser,
      dataClump: fetchDataHelper,

      body: channelFetchInfo.body,
      headers: channelFetchInfo.headers,
      method: channelFetchInfo.method,

      signal: fetchDataHelper.abortSignal.signal,
      totalFetchTimeout: fetchDataHelper.totalFetchTimeout,
      onTotalFetchTimeout: dataClump =>
        this.handleTotalFetchTimeout({ fetchDataHelper: dataClump }),
      betweenChunkTimeout: fetchDataHelper.betweenChunkTimeout,
      onBetweenChunkTimeout: dataClump =>
        this.handleBetweenChunkTimeout({ fetchDataHelper: dataClump }),
    });
  };

  private handleBetweenChunkTimeout = ({
    fetchDataHelper = getDataHelperPlaceholder(),
  }: HandleMessageTimerEndParams) => {
    this.customEmit(
      HttpChunkEvents.BETWEEN_CHUNK_TIMEOUT,
      getMessageLifecycleCallbackParam(fetchDataHelper),
    );
  };

  private handleTotalFetchTimeout = ({
    fetchDataHelper = getDataHelperPlaceholder(),
  }: HandleMessageTimerEndParams) => {
    this.customEmit(
      HttpChunkEvents.TOTAL_FETCH_TIMEOUT,
      getMessageLifecycleCallbackParam(fetchDataHelper),
    );
  };

  private handleError = ({ errorInfo }: HandleErrorParams) => {
    if (errorInfo.code === FetchStreamErrorCode.FetchException) {
      this.customEmit(HttpChunkEvents.FETCH_ERROR, errorInfo);
      return;
    }

    this.customEmit(HttpChunkEvents.READ_STREAM_ERROR, errorInfo);

    return;

    // TODO: The following should be the logic to re-pull the message. The server level did not have time to do it in this issue.
    // if (dataClump.retryCounter.matchMaxRetryAttempts()) {
    //   this.customOnError?.(errorInfo);
    //   //give up trying and try again
    //   this.handleFinish();
    //   return;
    // }

    // dataClump.retryCounter.add();
  };

  // Call the chat and resume interfaces to send messages, which has smoothed the difference at the upper level.
  sendMessage = (value: SendMessage, config?: SendMessageConfig) => {
    const localMessageID = value.local_message_id;

    if (!localMessageID) {
      // TODO: Use the same exception class
      this.customEmit(HttpChunkEvents.FETCH_ERROR, {
        code: FetchStreamErrorCode.FetchException,
        msg: 'SendMessageError: SendMessage is Invalid',
      });

      return;
    }

    const fetchDataHelper = new FetchDataHelper({
      localMessageID,
      retryCounterConfig: this.retryCounterConfig,
      betweenChunkTimeout: config?.betweenChunkTimeout,
      totalFetchTimeout: config?.totalFetchTimeout,
      headers: config?.headers,
    });

    if (this.fetchDataHelperMap.size >= MAX_DATA_HELPERS) {
      this.fetchDataHelperMap.clear();
    }

    this.fetchDataHelperMap.set(localMessageID, fetchDataHelper);

    const scene = config?.requestScene || RequestScene.SendMessage;
    // Get short URL request link
    const { url, baseURL } = this.requestManager.getSceneConfig?.(scene) || {};

    const fetchUrl = baseURL ? `${baseURL}${url}` : url;
    this.pullMessage({
      value,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl,
      scene,
    });
  };

  abort = (localMessageID: string) => {
    const targetFetchDataHelper = this.fetchDataHelperMap.get(localMessageID);
    this.fetchDataHelperMap.delete(localMessageID);

    if (targetFetchDataHelper?.abortSignal.signal.aborted) {
      return;
    }
    try {
      targetFetchDataHelper?.abortSignal.abort?.(ABORT_HTTP_CHUNK_MESSAGE);

      this.reportLogWithScope.slardarSuccessEvent({
        eventName: SlardarEvents.HTTP_CHUNK_UNEXPECTED_ABORT_ERROR,
      });
    } catch (rawError) {
      const error = new ChatCoreError(
        'An error occurred in calling abort in synchronous code',
        { rawError },
      );
      this.reportLogWithScope.slardarErrorEvent({
        eventName: SlardarEvents.HTTP_CHUNK_UNEXPECTED_ABORT_ERROR,
        error,
        meta: error.flatten(),
      });
    }
  };

  drop = () => {
    this.fetchDataHelperMap.forEach(clump => {
      this.abort(clump.localMessageID);
    });
  };
}
