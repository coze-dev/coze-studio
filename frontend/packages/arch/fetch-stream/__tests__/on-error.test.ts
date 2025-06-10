import {
  type FetchSteamConfig,
  FetchStreamErrorCode,
  fetchStream,
} from '../src';
import {
  createFakeFetch,
  createFakeReadableStream,
  errorParseEventCode,
  invalidMessageRawChunkList,
  streamParser,
} from './fake-data';

describe('fetch-stream, onError 回调测试', () => {
  const onErrorDataClump = { testClump: 'onError' };

  test('response 网络异常, onError 回调', () =>
    new Promise((resolve, reject) => {
      const invalidStatus = 599;
      const errorMsg = `Invalid Response, ResponseStatus: ${invalidStatus}`;

      const fetchWithInvalidStatus = createFakeFetch(null, {
        status: invalidStatus,
      });

      const onError: FetchSteamConfig['onError'] = ({
        fetchStreamError,
        dataClump,
      }) => {
        try {
          expect(fetchStreamError).toStrictEqual({
            msg: errorMsg,
            code: FetchStreamErrorCode.FetchException,
            error: new Error(errorMsg),
          });
          expect(dataClump).toBe(onErrorDataClump);
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      };

      fetchStream('/test', {
        fetch: fetchWithInvalidStatus,
        onError,
        dataClump: onErrorDataClump,
      });
    }));

  test('自定义 onStart 抛出异常, onError 回调', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const errorMsg = '自定义 onStart 抛出异常';
      const onStart: FetchSteamConfig['onStart'] = () => {
        throw new Error(errorMsg);
      };

      const onError: FetchSteamConfig['onError'] = ({
        fetchStreamError,
        dataClump,
      }) => {
        try {
          expect(fetchStreamError).toStrictEqual({
            msg: errorMsg,
            code: FetchStreamErrorCode.FetchException,
            error: new Error(errorMsg),
          });

          expect(dataClump).toBe(onErrorDataClump);
        } catch (error) {
          reject(error);
        }

        resolve('ok');
      };

      fetchStream('/test', {
        fetch: fakeFetch,
        onStart,
        onError,
        dataClump: onErrorDataClump,
      });
    }));

  test('response 业务异常, onError 回调', () =>
    new Promise((resolve, reject) => {
      const invalidCode = 7777000;
      const errorMsg = '参数不合法';
      const invalidResponseBody = { code: invalidCode, msg: errorMsg };

      const fetchWithInvalidResponse = createFakeFetch(
        JSON.stringify(invalidResponseBody),
        { status: 200 },
      );

      const onError: FetchSteamConfig['onError'] = ({
        fetchStreamError,
        dataClump,
      }) => {
        try {
          expect(fetchStreamError).toStrictEqual({
            msg: errorMsg,
            code: invalidCode,
            error: invalidResponseBody,
          });
          expect(dataClump).toBe(onErrorDataClump);
        } catch (error) {
          reject(error);
        }

        resolve('ok');
      };

      fetchStream('/test', {
        fetch: fetchWithInvalidResponse,
        onError,
        dataClump: onErrorDataClump,
      });
    }));

  test('validate message 不通过, onError 回调', () =>
    new Promise((resolve, reject) => {
      const fakeFetchWithErrorMessage = createFakeFetch(
        createFakeReadableStream(invalidMessageRawChunkList),
      );
      const onError: FetchSteamConfig['onError'] = ({
        fetchStreamError,
        dataClump,
      }) => {
        const msg =
          '{"message":{"role":"assistant","type":"answer","content":"么","content_type":"text","message_id":"7325375413339979820","reply_id":"7325375413339947052","section_id":"7325329150829576236","extra_info":{"local_message_id":"","input_price":"","input_tokens":"509","output_price":"","output_tokens":"9","token":"","total_price":"","plugin_status":"","time_cost":"","workflow_tokens":"","workflow_price":"","bot_state":"{\\"bot_id\\":\\"7323033109342257196\\",\\"agent_name\\":\\"问答助手\\",\\"agent_id\\":\\"7323097685857681452\\"}","plugin_request":"","tool_name":"","is_error":false},"status":""},"is_finish":false,"index":1,"conversation_id":"7324887697129144364","seq_id":8}';
        try {
          expect(fetchStreamError).toStrictEqual({
            msg,
            code: FetchStreamErrorCode.HttpChunkStreamingException,
            error: new Error(msg),
          });

          expect(dataClump).toBe(onErrorDataClump);
        } catch (error) {
          reject(error);
        }

        resolve('ok');
      };

      fetchStream('/test', {
        fetch: fakeFetchWithErrorMessage,
        onError,
        dataClump: onErrorDataClump,
        validateMessage: ({ message }) => {
          if (message.type === 'event' && message.event === 'error') {
            return {
              status: 'error',
              error: new Error(message.data),
            };
          }
          return {
            status: 'success',
          };
        },
      });
    }));

  test('流式接收 message 中途, 出现服务端异常', () =>
    new Promise((resolve, reject) => {
      const fakeFetchWithErrorMessage = createFakeFetch(
        createFakeReadableStream(invalidMessageRawChunkList),
      );
      const onError: FetchSteamConfig['onError'] = ({
        fetchStreamError,
        dataClump,
      }) => {
        const msg =
          '{"message":{"role":"assistant","type":"answer","content":"么","content_type":"text","message_id":"7325375413339979820","reply_id":"7325375413339947052","section_id":"7325329150829576236","extra_info":{"local_message_id":"","input_price":"","input_tokens":"509","output_price":"","output_tokens":"9","token":"","total_price":"","plugin_status":"","time_cost":"","workflow_tokens":"","workflow_price":"","bot_state":"{\\"bot_id\\":\\"7323033109342257196\\",\\"agent_name\\":\\"问答助手\\",\\"agent_id\\":\\"7323097685857681452\\"}","plugin_request":"","tool_name":"","is_error":false},"status":""},"is_finish":false,"index":1,"conversation_id":"7324887697129144364","seq_id":8}';
        try {
          expect(fetchStreamError).toStrictEqual({
            msg,
            code: errorParseEventCode,
            error: { msg, code: errorParseEventCode },
          });

          expect(dataClump).toBe(onErrorDataClump);
        } catch (error) {
          reject(error);
        }

        resolve('ok');
      };

      fetchStream('/test', {
        fetch: fakeFetchWithErrorMessage,
        onError,
        dataClump: onErrorDataClump,
        streamParser,
      });
    }));

  test('fetch 过程中被 abort, onError 回调', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onError: FetchSteamConfig['onError'] = vi.fn(
        () => 'have been called',
      );
      const abortController = new AbortController();
      fetchStream('/test', {
        fetch: fakeFetch,
        signal: abortController.signal,
      }).then(() => {
        try {
          expect(onError).not.toHaveBeenCalled();
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });
      abortController.abort();
    }));
  test('处理 readableStream 过程中被 abort, onError 回调', () =>
    new Promise((resolve, reject) => {
      const fakeFetch = createFakeFetch(createFakeReadableStream());

      const onError: FetchSteamConfig['onError'] = vi.fn(
        () => 'have been called',
      );
      const abortController = new AbortController();
      fetchStream('/test', {
        fetch: fakeFetch,
        signal: abortController.signal,
      }).then(() => {
        try {
          expect(onError).not.toHaveBeenCalled();
        } catch (error) {
          reject(error);
        }
        resolve('ok');
      });

      setTimeout(() => {
        abortController.abort();
      }, 500);
    }));
});
