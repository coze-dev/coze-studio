import { fetchStream, type FetchSteamConfig } from '../src';
import { createFakeFetch, createFakeReadableStream } from './fake-data';

describe('fetch-stream, onSuccess 回调测试', () => {
  const onSuccessDataClump = { testClump: 'onSuccess' };

  test('onSuccess 入参正确', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onAllSuccess: FetchSteamConfig['onAllSuccess'] = dataClump => {
        try {
          expect(dataClump).toBe(onSuccessDataClump);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
        return Promise.resolve();
      };

      fetchStream('/test', {
        fetch: fakeFetch,
        onAllSuccess,
        dataClump: onSuccessDataClump,
      });
    }));

  test('onFinish 只调用一次', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onAllSuccess: FetchSteamConfig['onAllSuccess'] = vi.fn(() => {
        'ok. I am finish';
        return;
      });

      fetchStream('/test', { fetch: fakeFetch, onAllSuccess }).then(() => {
        try {
          expect(onAllSuccess).toHaveBeenCalledOnce();
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));
});
