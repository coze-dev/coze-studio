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

import { type ParseEvent } from 'eventsource-parser';

export enum FetchStreamErrorCode {
  FetchException = 10001,
  HttpChunkStreamingException = 10002,
}

export interface FetchStreamErrorInfo {
  code: FetchStreamErrorCode | number;
  msg: string;
}

export interface FetchStreamError extends FetchStreamErrorInfo {
  error: unknown;
}

export type ValidateResult =
  | {
      status: 'success';
    }
  | {
      status: 'error';
      error: Error;
    };

/**
 * {@link RequestInfo} and {@link RequestInit} are the original parameter types of Fetch
 */

export interface FetchSteamConfig<Message = ParseEvent, DataClump = unknown>
  extends RequestInit {
  /**
   *  Called when fetch starts
   */
  onFetchStart?: (params?: DataClump) => void;

  /**
   * Call this method when fetch returns a response. Use this method to verify that the Response meets expectations, and throw an error when it does not
   * Whether or not this method is provided, the existence of the Response.ok flag and Response.body is automatically verified
   */
  onStart?: (response: Response) => Promise<void>;

  /**
   *  This callback is triggered when fetch successfully returns a response and onStart succeeds
   */
  onFetchSuccess?: (params?: DataClump) => void;

  /**
   * This callback is triggered when you start reading ReadableStream. onFetchSuccess is followed by this callback
   */
  onStartReadStream?: (params?: DataClump) => void;

  /**
   * The chunk data returned by the server level is parsed during streaming, and when the return value conforms to the type {@link Message}, it is expected to respond in subsequent {@link onMessage} methods
   * You can interrupt or throw an error during parsing, and throwing an error will also interrupt the entire stream parsing
   * If not provided, onMessage directly responds to chunk data
   */
  streamParser?: (
    parseEvent: ParseEvent,
    method: {
      /**
       * Abort current streaming read behavior
       */
      terminate: () => void;
      /**
       * @deprecated
       * Throw an error and abort the current stream reading behavior. If there is still normal data in the stream that has not been read, it will also be terminated together.
       */
      onParseError: (error: FetchStreamErrorInfo) => void;
    },
  ) => Message | undefined;

  /**
   * Execute before the onMessage callback. Handling of business errors and throwing recommendations are handled in this callback
   */
  validateMessage?: (params: {
    message: Message;
    dataClump?: DataClump;
  }) => ValidateResult;

  /**
   * After receiving the server level Chunk data and parsing (if any), call this method if there are no exceptions in the process
   */
  onMessage?: (params: { message: Message; dataClump?: DataClump }) => void;

  /**
   * Call this method when fetchStream resolves
   */
  onAllSuccess?: (params?: DataClump) => void;

  /**
   * This method will be called if any errors occur during the fetchStream process, including fetch/streaming chunk/response illegal, etc
   * Does not automatically retry
   */
  onError?: (params: {
    fetchStreamError: FetchStreamError;
    dataClump?: DataClump;
  }) => void;

  /** Fetch method, the default is window.fetch */
  fetch?: typeof fetch;

  /**
   * {@link https://book-refactoring2.ifmicro.com/docs/ch3.html#310-%E6%95%B0%E6%8D%AE%E6%B3%A5%E5%9B%A2%EF%BC%88data-clumps%EF%BC%89}
   * If you want to maintain some business data and state for each fetchStream, it is recommended to pass in the abstracted data instances here. They will appear in each callback function
   */
  dataClump?: DataClump;

  /**
   * The timeout of the entire process of fetch stream, in: ms. Default or pass in 0 to indicate that the timer is not turned on
   */
  totalFetchTimeout?: number;

  /**
   * This callback is triggered when totalFetchTimeout is set and expires. There will be no other side effects, such as abort requests. Please handle it yourself as needed
   */
  onTotalFetchTimeout?: (params?: DataClump) => void;

  /**
   * Timeout time between chunks. During the processing of the stream, the timing starts from the receipt of the previous chunk. When the next chunk is received, the timing is cleared and re-timed.
   * Default or incoming 0 means the timer is not turned on, unit: ms
   */
  betweenChunkTimeout?: number;

  /**
   * This callback is triggered when chunkTimeout is set and the timer expires. In addition, there will be no other side effects, such as: abort request. Please handle it yourself as needed
   */
  onBetweenChunkTimeout?: (params?: DataClump) => void;
}
