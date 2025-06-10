import { type FetchSteamConfig, fetchStream } from '../src';
import { createFakeFetch, createFakeReadableStream } from './fake-data';

describe('fetch-stream, onTotalFetchTimeout 测试', () => {
  const onTotalFetchTimeoutDataClump = {
    testClump: 'onTotalFetchTimeout',
  };

  test('onTotalFetchTimeout 触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onTotalFetchTimeout: FetchSteamConfig['onTotalFetchTimeout'] =
        vi.fn(_dataClump => {
          ('ok');
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onTotalFetchTimeout,
        dataClump: onTotalFetchTimeoutDataClump,
        totalFetchTimeout: 100,
      }).then(() => {
        try {
          expect(onTotalFetchTimeout).toHaveBeenCalledTimes(1);
          expect(onTotalFetchTimeout).toHaveBeenLastCalledWith(
            onTotalFetchTimeoutDataClump,
          );
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));

  test('onTotalFetchTimeout 未超时，不触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onTotalFetchTimeout: FetchSteamConfig['onTotalFetchTimeout'] =
        vi.fn(_dataClump => {
          'ok';
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onTotalFetchTimeout,
        dataClump: onTotalFetchTimeoutDataClump,
        totalFetchTimeout: 3000,
      }).then(() => {
        try {
          expect(onTotalFetchTimeout).toHaveBeenCalledTimes(0);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));

  test('onTotalFetchTimeout 未设置 timeDuration, 不触发', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onTotalFetchTimeout: FetchSteamConfig['onTotalFetchTimeout'] =
        vi.fn(_dataClump => {
          'ok';
        });
      fetchStream('/test', {
        fetch: fakeFetch,
        onTotalFetchTimeout,
        dataClump: onTotalFetchTimeoutDataClump,
      }).then(() => {
        try {
          expect(onTotalFetchTimeout).toHaveBeenCalledTimes(0);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));
});
