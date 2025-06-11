import { ReadableStream } from 'web-streams-polyfill';

import { type FetchSteamConfig } from '../../src';
import ValidDecodedChunkList from './valid-decoded-chunk-list.json';
import ParseEventList from './parse-event-list.json';
import MessageList from './message-list.json';
import InvalidDecodedChunkList from './invalid-decoded-chunk-list.json';
/**
 * 完整消息
 * 你好！请问有什么我可以帮助您的吗？是否有关于COZE平台的问题？
 * @module ValidDecodedChunkList mock 服务端返回的数据，实际上是以 Uint8Array 返回
 * @module InvalidDecodedChunkList mock 服务端返回的数据，实际上是以 Uint8Array 返回，包含了 error 信息
 * @module ParseEventList 对应上方 DecodedChunkList 解析后实际响应的 parseEvent
 * @module MessageList 对应上方 decodedChunkList 解析后实际响应的 message
 */
export {
  ParseEventList,
  MessageList,
  ValidDecodedChunkList,
  InvalidDecodedChunkList,
};

const textEncoder = new TextEncoder();

export const validMessageRawChunkList: Uint8Array[] = ValidDecodedChunkList.map(
  stringChunk => textEncoder.encode(stringChunk),
);

export const invalidMessageRawChunkList: Uint8Array[] =
  InvalidDecodedChunkList.map(stringChunk => textEncoder.encode(stringChunk));

export const errorParseEventCode = 9999;

export const streamParser: Required<FetchSteamConfig>['streamParser'] = (
  parseEvent,
  { terminate, onParseError },
) => {
  const { type } = parseEvent;

  if (type === 'event') {
    const { data, event } = parseEvent;
    switch (event) {
      case 'message':
        return JSON.parse(data);
      case 'done':
        terminate();
        return;
      case 'error':
        onParseError({ msg: data, code: errorParseEventCode });

        return;
      default:
        return;
    }
  }
};

export const createFakeReadableStream = (
  raw = validMessageRawChunkList,
  timeout = 100,
) => {
  let interval: ReturnType<typeof setInterval>;
  let chunkIndex = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      interval = setInterval(() => {
        const targetChunk = raw.at(chunkIndex);
        // Add the rawChunk to the stream
        if (!targetChunk) {
          clearInterval(interval);
          controller.close();
          return;
        }
        controller.enqueue(targetChunk);
        chunkIndex += 1;
      }, timeout);
    },
    pull(_controller) {
      // We don't really need a pull in this test set
    },
    cancel() {
      // This is called if the reader cancels,
      // so we should stop generating strings
      clearInterval(interval);
    },
  });
  return stream;
};

export const createFakeFetch = (
  inputBody: BodyInit | null,

  responseInit?: ResponseInit,
) => {
  const fakeFetch: typeof fetch = () =>
    Promise.resolve(new Response(inputBody, responseInit));
  return fakeFetch;
};
