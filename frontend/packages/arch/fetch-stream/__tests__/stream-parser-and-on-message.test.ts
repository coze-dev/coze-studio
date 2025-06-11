import { type FetchSteamConfig, fetchStream } from '../src';
import {
  MessageList,
  ParseEventList,
  createFakeFetch,
  createFakeReadableStream,
  streamParser,
} from './fake-data';

describe('fetch-stream, streamParser 与 onMessage 测试', () => {
  const onMessageDataClump = {
    testClump: 'onMessage',
  };

  test('streamParse 调用次数与入参是否正确', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const parseEventCallIndexList = Array.from({
        length: ParseEventList.length,
      }).map((_, index) => index + 1);

      const messageCallIndexList = Array.from({
        length: MessageList.length,
      }).map((_, index) => index + 1);

      const controllerFnList: Parameters<
        Required<FetchSteamConfig>['streamParser']
      >[1][] = [];

      const localeStreamParser: FetchSteamConfig['streamParser'] = vi.fn(
        (parseEvent, fn) => {
          controllerFnList.push(fn);

          return streamParser(parseEvent, fn);
        },
      );
      const onMessage: FetchSteamConfig['onMessage'] = vi.fn(() => {
        'empty function';
      });

      fetchStream('/test', {
        fetch: fakeFetch,
        onMessage,
        streamParser: localeStreamParser,
        dataClump: onMessageDataClump,
      }).then(() => {
        try {
          parseEventCallIndexList.forEach(index => {
            expect(localeStreamParser).toHaveBeenNthCalledWith(
              index,
              {
                ...ParseEventList.at(index - 1),
                id: undefined,
              },
              controllerFnList.at(index - 1),
            );
          });

          messageCallIndexList.forEach(index => {
            expect(onMessage).toHaveBeenNthCalledWith(index, {
              message: MessageList.at(index - 1),
              dataClump: onMessageDataClump,
            });
          });
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));
});
