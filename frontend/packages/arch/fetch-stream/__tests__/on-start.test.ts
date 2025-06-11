import { type FetchSteamConfig, fetchStream } from '../src';
import { createFakeFetch, createFakeReadableStream } from './fake-data';

describe('fetch-stream, onStart 回调测试', () => {
  test('onStart 入参正确', () =>
    new Promise((resolve, reject) => {
      const responseBodyInit: BodyInit = createFakeReadableStream();
      const fakeFetch = createFakeFetch(responseBodyInit);

      const onStart: FetchSteamConfig['onStart'] = localeResponse => {
        try {
          expect(localeResponse).toStrictEqual(new Response(responseBodyInit));
        } catch (error) {
          reject(error);
        }
        resolve('ok');
        return Promise.resolve();
      };

      fetchStream('/test', { fetch: fakeFetch, onStart });
    }));

  test('onStart 只调用一次', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onStart: FetchSteamConfig['onStart'] = vi.fn(() =>
        Promise.resolve(),
      );

      fetchStream('/test', { fetch: fakeFetch, onStart }).then(() => {
        try {
          expect(onStart).toHaveBeenCalledOnce();
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
    }));
});
