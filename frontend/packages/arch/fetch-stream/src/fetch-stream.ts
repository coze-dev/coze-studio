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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function */
import {
  createParser,
  type ParseEvent,
  type EventSourceParser,
} from 'eventsource-parser';

import {
  getFetchErrorInfo,
  getStreamingErrorInfo,
  isAbortError,
  onStart,
  validateChunk,
} from './utils';
import { type FetchSteamConfig } from './type';

/** Initiate a request for a streaming message pull */
export async function fetchStream<Message = ParseEvent, DataClump = unknown>(
  requestInfo: RequestInfo,
  {
    onStart: inputOnStart,
    onError,
    onAllSuccess,
    onFetchStart,
    onFetchSuccess,
    onStartReadStream,
    onMessage,
    fetch: inputFetch,
    dataClump,
    signal,
    streamParser,
    totalFetchTimeout,
    onTotalFetchTimeout,
    betweenChunkTimeout,
    onBetweenChunkTimeout,
    validateMessage,
    ...rest
  }: FetchSteamConfig<Message, DataClump>,
): Promise<void> {
  const webStreamsPolyfill = await import(
    /*webpackChunkName: "web-streams-polyfill"*/ 'web-streams-polyfill/ponyfill'
  );
  const { ReadableStream, WritableStream, TransformStream } =
    webStreamsPolyfill as {
      ReadableStream?: typeof globalThis.ReadableStream;
      WritableStream: typeof globalThis.WritableStream;
      TransformStream: typeof globalThis.TransformStream;
    };
  const { createReadableStreamWrapper } = await import(
    /*webpackChunkName: "web-streams-polyfill"*/ '@mattiasbuelens/web-streams-adapter'
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const readableStreamWrapper = createReadableStreamWrapper(ReadableStream!);

  return new Promise<void>(resolve => {
    const decoder = new TextDecoder();
    const fetch = inputFetch ?? window.fetch;

    let totalFetchTimer: ReturnType<typeof setTimeout> | null = null;
    let betweenChunkTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Clear time
     * All abnormal exits
     * Create function return
     * readStream ends
     * abortSignal trigger
     */
    const clearTotalFetchTimer = () => {
      if (!totalFetchTimer) {
        return;
      }
      clearTimeout(totalFetchTimer);
      totalFetchTimer = null;
    };

    /**
     * Set the timing
     * Fetch set once, only once
     */
    const setTotalFetchTimer = () => {
      if (totalFetchTimeout && onTotalFetchTimeout) {
        totalFetchTimer = setTimeout(() => {
          onTotalFetchTimeout(dataClump);
          clearTotalFetchTimer();
        }, totalFetchTimeout);
      }
    };

    /**
     * Clear time
     * readStream exits abnormally
     * readStream ends
     * Got a new chunk
     * abortSignal trigger
     */
    const clearBetweenChunkTimer = () => {
      if (!betweenChunkTimer) {
        return;
      }
      clearTimeout(betweenChunkTimer);
      betweenChunkTimer = null;
    };

    /**
     * Set the timing
     * readStream is set once before
     * Set every time a chunk is received and clearBetweenChunkTimer executed
     */
    const setBetweenChunkTimer = () => {
      if (betweenChunkTimeout && onBetweenChunkTimeout) {
        betweenChunkTimer = setTimeout(() => {
          onBetweenChunkTimeout(dataClump);
          clearBetweenChunkTimer();
        }, betweenChunkTimeout);
      }
    };

    signal?.addEventListener('abort', () => {
      // After aborting here, both the readableStream and writableStream below will stop.
      clearTotalFetchTimer();
      clearBetweenChunkTimer();
      resolve();
    });

    const fetchAndVerifyResponse = async () => {
      try {
        setTotalFetchTimer();

        onFetchStart?.(dataClump);

        const response = await fetch(requestInfo, {
          signal,
          ...rest,
        });

        await onStart(response, inputOnStart);

        onFetchSuccess?.(dataClump);

        return response;
      } catch (error) {
        /**
         * Mistakes that will be caught here
         * Fetch server level returned exception
         * Js error, such as thrown by onStart
         * The signal was aborted during fetching
         */

        // Being aborted is not considered an exception, and onError is not called.
        if (isAbortError(error)) {
          return;
        }
        clearTotalFetchTimer();
        onError?.({
          fetchStreamError: getFetchErrorInfo(error),
          dataClump,
        });
      }
    };

    const readStream = async (
      responseBody: globalThis.ReadableStream<Uint8Array>,
    ) => {
      setBetweenChunkTimer();
      let parser: EventSourceParser;
      const streamTransformer = new TransformStream<ArrayBuffer, Message>({
        start(controller) {
          parser = createParser(parseEvent => {
            if (!streamParser) {
              controller.enqueue(parseEvent as Message);
              return;
            }

            const terminateFn = controller.terminate;
            const onParseErrorFn = controller.error;

            const result = streamParser?.(parseEvent, {
              terminate: terminateFn.bind(controller),
              onParseError: onParseErrorFn.bind(controller),
            });

            if (result) {
              controller.enqueue(result);
            }
          });
        },
        transform(chunk, controller) {
          clearBetweenChunkTimer();
          setBetweenChunkTimer();

          const decodedChunk = decoder.decode(chunk, { stream: true });

          try {
            //
            validateChunk(decodedChunk);

            // The above start will be executed at the same time as the TransformStream is built, so the parser can be fetched when executed here.
            parser.feed(decodedChunk);
          } catch (chunkError) {
            // Handling business errors thrown by validateChunk
            // The server level does not stream back business errors. Error structure: {msg: 'xxx', code: 123456}
            controller.error(chunkError);
          }
        },
      });

      const streamWriter = new WritableStream<Message>({
        async write(chunk, controller) {
          // Write messages asynchronously to avoid false panic pipeline flow in callbacks
          await Promise.resolve();
          const param = { message: chunk, dataClump };
          const validateResult = validateMessage?.(param);

          if (validateResult && validateResult.status === 'error') {
            /**
             * WritableStream will be interrupted, even if there is still data, it will not be written again
             */
            throw validateResult.error;
          }

          onMessage?.(param);
        },
      });

      try {
        onStartReadStream?.(dataClump);

        await (
          readableStreamWrapper(
            responseBody,
          ) as unknown as ReadableStream<ArrayBuffer>
        )
          .pipeThrough(streamTransformer)
          .pipeTo(streamWriter);

        clearTotalFetchTimer();

        clearBetweenChunkTimer();

        onAllSuccess?.(dataClump);

        resolve();
      } catch (streamError) {
        /**
         * Mistakes that will be caught here
         * Exception at server level in streaming return
         * js error
         * The signal was aborted during streaming return
         * The above onParseErrorFn is called
         */

        // Being aborted is not considered an exception, and onError is not called.
        if (isAbortError(streamError)) {
          return;
        }

        clearTotalFetchTimer();
        clearBetweenChunkTimer();

        onError?.({
          fetchStreamError: getStreamingErrorInfo(streamError),
          dataClump,
        });
      }
    };

    async function create(): Promise<void> {
      const response = await fetchAndVerifyResponse();
      const body = response?.body;
      // The response invalid and no body errors are handled in onStart above
      if (!body) {
        clearTotalFetchTimer();
        return;
      }
      await readStream(body);
    }
    create();
  });
}
