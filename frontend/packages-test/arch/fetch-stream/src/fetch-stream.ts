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

/** 发起流式消息拉取的请求 */
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
     * clear 时机
     * 所有异常退出
     * create 函数 return
     * readStream 结束
     * abortSignal 触发
     */
    const clearTotalFetchTimer = () => {
      if (!totalFetchTimer) {
        return;
      }
      clearTimeout(totalFetchTimer);
      totalFetchTimer = null;
    };

    /**
     * set 时机
     * fetch 之间 set 一次, 只此一次
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
     * clear 时机
     * readStream 异常退出
     * readStream 结束
     * 收到了新 chunk
     * abortSignal 触发
     */
    const clearBetweenChunkTimer = () => {
      if (!betweenChunkTimer) {
        return;
      }
      clearTimeout(betweenChunkTimer);
      betweenChunkTimer = null;
    };

    /**
     * set 时机
     * readStream 之前 set 一次
     * 每次收到 chunk 并执行了 clearBetweenChunkTimer 时 set 一次
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
      // 此处 abort 后下方 readableStream 与 writableStream 都会停止
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
         * 这里会被 catch 的错误
         * fetch 服务端返回异常
         * js error，例如被 onStart 抛出的
         * fetch 过程中 signal 被 abort
         */

        // 被 abort 不认为是异常，不调用 onError
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

            // 上方 start 会在 TransformStream 被构建的同时执行，所以此处执行时能取到 parser
            parser.feed(decodedChunk);
          } catch (chunkError) {
            // 处理 validateChunk 抛出的业务错误
            // 服务端不会流式返回业务错误，错误结构：{ msg: 'xxx', code: 123456 }
            controller.error(chunkError);
          }
        },
      });

      const streamWriter = new WritableStream<Message>({
        async write(chunk, controller) {
          // 写消息异步化 避免回调中的错误 panic 管道流
          await Promise.resolve();
          const param = { message: chunk, dataClump };
          const validateResult = validateMessage?.(param);

          if (validateResult && validateResult.status === 'error') {
            /**
             * 会中断 WritableStream, 即使还有数据也会被中断, 不会再写了
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
         * 这里会被 catch 的错误
         * 流式返回中服务端异常
         * js error
         * 流式返回过程中被 signal 被 abort
         * 上方 onParseErrorFn 被调用
         */

        // 被 abort 不认为是异常，不调用 onError
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
      // response 不合法与没有 body 的错误在上方 onStart 中处理过
      if (!body) {
        clearTotalFetchTimer();
        return;
      }
      await readStream(body);
    }
    create();
  });
}
