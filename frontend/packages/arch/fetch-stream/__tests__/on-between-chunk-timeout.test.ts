import { type FetchSteamConfig, fetchStream } from '../src';
import { createFakeFetch, validMessageRawChunkList } from './fake-data';

const createFakeReadableStreamWithRandomTimeout = (
  raw = validMessageRawChunkList,
) => {
  let timer: ReturnType<typeof setTimeout>;
  let chunkIndex = 0;
  const getTimeout = () => Math.random() * 100 + 100;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueueChunk = () => {
        const targetChunk = raw.at(chunkIndex);
        // Add the rawChunk to the stream
        if (!targetChunk) {
          clearTimeout(timer);
          controller.close();
          return;
        }
        controller.enqueue(targetChunk);
        chunkIndex += 1;
        clearTimeout(timer);
        timer = setTimeout(enqueueChunk, getTimeout());
      };

      timer = setTimeout(enqueueChunk, getTimeout());
    },
    pull(_controller) {
      // We don't really need a pull in this test set
    },
    cancel() {
      // This is called if the reader cancels,
      // so we should stop generating strings
      clearTimeout(timer);
    },
  });
  return stream;
};

describe('fetch-stream, onBetweenChunkTimeout 测试', () => {
  const onBetweenChunkTimeoutDataClump = {
    testClump: 'onBetweenChunkTimeout',
  };

  test('onBetweenChunkTimeout 触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(
        createFakeReadableStreamWithRandomTimeout(),
      );
      let count = 0;
      const onBetweenChunkTimeout: FetchSteamConfig['onBetweenChunkTimeout'] =
        vi.fn(_dataClump => {
          count += 1;
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onBetweenChunkTimeout,
        dataClump: onBetweenChunkTimeoutDataClump,
        betweenChunkTimeout: 50,
      }).then(() => {
        try {
          expect(onBetweenChunkTimeout).toHaveBeenCalled();
          expect(onBetweenChunkTimeout).toHaveBeenCalledTimes(count);
          expect(onBetweenChunkTimeout).toHaveBeenLastCalledWith(
            onBetweenChunkTimeoutDataClump,
          );
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));

  test('onBetweenChunkTimeout 未超时，不触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(
        createFakeReadableStreamWithRandomTimeout(),
      );

      const onBetweenChunkTimeout: FetchSteamConfig['onBetweenChunkTimeout'] =
        vi.fn(_dataClump => {
          'ok';
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onBetweenChunkTimeout,
        dataClump: onBetweenChunkTimeoutDataClump,
        betweenChunkTimeout: 3000,
      }).then(() => {
        try {
          // 服务端推送 sse 以及包间超时场景
          // 无法 mock timers
          expect(onBetweenChunkTimeout).toHaveBeenCalledTimes(0);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));

  test('onBetweenChunkTimeout 未设置 betweenChunkTimeout, 不触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(
        createFakeReadableStreamWithRandomTimeout(),
      );

      const onBetweenChunkTimeout: FetchSteamConfig['onBetweenChunkTimeout'] =
        vi.fn(_dataClump => {
          'ok';
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onBetweenChunkTimeout,
        dataClump: onBetweenChunkTimeoutDataClump,
      }).then(() => {
        try {
          expect(onBetweenChunkTimeout).toHaveBeenCalledTimes(0);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));
});
