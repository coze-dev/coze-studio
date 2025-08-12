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

import { vi } from 'vitest';
import { fetchStream, FetchStreamErrorCode } from '@coze-arch/fetch-stream';

import { RequestScene } from '@/request-manager/types';
import { type RequestManager } from '@/request-manager';
import { type ReportLog } from '@/report-log';
import { ChatCoreError } from '@/custom-error';
import { type TokenManager } from '@/credential';
import {
  ChunkEvent,
  FetchDataHelper,
  getDataHelperPlaceholder,
  getMessageLifecycleCallbackParam,
  inValidChunkRaw,
} from '@/channel/http-chunk/utils';
import { SlardarEvents } from '@/channel/http-chunk/events/slardar-events';
import { HttpChunkEvents } from '@/channel/http-chunk/events/http-chunk-events';
import { HttpChunk } from '@/channel/http-chunk';

vi.mock('@/channel/http-chunk/utils', async () => {
  const actual = await vi.importActual('@/channel/http-chunk/utils');
  return {
    ...actual,
    getDataHelperPlaceholder: vi.fn(),
    inValidChunkRaw: vi.fn(),
  };
});

vi.mock('@coze-arch/fetch-stream', async () => {
  const actual = await vi.importActual('@coze-arch/fetch-stream');
  return {
    ...actual,
    fetchStream: vi.fn(),
  };
});

let httpChunk: HttpChunk;
let mockRequestManager: RequestManager;
let mockTokenManager: TokenManager;
let mockReportLogWithScope: ReportLog;
beforeEach(() => {
  mockRequestManager = {
    getSceneConfig: vi.fn().mockReturnValue({ url: '/test-url', baseURL: '' }),
  } as unknown as RequestManager;

  mockTokenManager = {
    getApiKeyAuthorizationValue: vi.fn().mockReturnValue('Bearer test-token'),
  } as unknown as TokenManager;

  mockReportLogWithScope = {
    slardarSuccessEvent: vi.fn(),
    slardarErrorEvent: vi.fn(),
  } as unknown as ReportLog;

  httpChunk = new HttpChunk({
    requestManager: mockRequestManager,
    tokenManager: mockTokenManager,
    reportLogWithScope: mockReportLogWithScope,
  });
});
describe('httpChunk', () => {
  it('sendMessage should emit FETCH_ERROR when localMessageID is missing', () => {
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');
    httpChunk.sendMessage({});

    expect(mockEmit).toHaveBeenCalledWith(HttpChunkEvents.FETCH_ERROR, {
      code: FetchStreamErrorCode.FetchException,
      msg: 'SendMessageError: SendMessage is Invalid',
    });
  });

  it('sendMessage should add fetchDataHelper to the map and call pullMessage', async () => {
    const mockPullMessage = vi
      .spyOn(httpChunk, 'pullMessage')
      .mockResolvedValue(undefined);
    const message = { local_message_id: 'test-id' };

    await httpChunk.sendMessage(message);

    expect(httpChunk.fetchDataHelperMap.get('test-id')).toBeDefined();
    expect(mockPullMessage).toHaveBeenCalled();
  });

  it('sendMessage reach MAX_DATA_HELPERS', () => {
    const mockClear = vi.spyOn(httpChunk.fetchDataHelperMap, 'clear');
    const message = { local_message_id: 'test-id' };
    for (let i = 0; i < 101; i++) {
      httpChunk.fetchDataHelperMap.set(
        i.toString(),
        getDataHelperPlaceholder(),
      );
    }
    httpChunk.sendMessage(message);
    expect(mockClear).toBeCalled();
  });

  it('abort should remove fetchDataHelper and call abortSignal.abort', () => {
    const messageID = 'test-id';
    const mockFetchDataHelper = {
      abortSignal: { signal: { aborted: false }, abort: vi.fn() },
    } as unknown as FetchDataHelper;

    httpChunk.fetchDataHelperMap.set(messageID, mockFetchDataHelper);
    httpChunk.abort(messageID);

    expect(httpChunk.fetchDataHelperMap.has(messageID)).toBe(false);
    expect(mockFetchDataHelper.abortSignal.abort).toHaveBeenCalled();
  });

  it('abort should not call abort if signal already aborted', () => {
    const messageID = 'test-id';
    const mockFetchDataHelper = {
      abortSignal: { signal: { aborted: true }, abort: vi.fn() },
    } as unknown as FetchDataHelper;

    httpChunk.fetchDataHelperMap.set(messageID, mockFetchDataHelper);
    httpChunk.abort(messageID);

    expect(mockFetchDataHelper.abortSignal.abort).not.toHaveBeenCalled();
  });

  it('abort should report error if abortSignal.abort throws an exception', () => {
    const messageID = 'test-id';
    const mockFetchDataHelper = {
      abortSignal: {
        signal: { aborted: false },
        abort: vi.fn().mockImplementation(() => {
          throw new Error('abort error');
        }),
      },
    } as unknown as FetchDataHelper;

    httpChunk.fetchDataHelperMap.set(messageID, mockFetchDataHelper);
    httpChunk.abort(messageID);

    expect(mockReportLogWithScope.slardarErrorEvent).toHaveBeenCalledWith({
      eventName: SlardarEvents.HTTP_CHUNK_UNEXPECTED_ABORT_ERROR,
      error: expect.any(ChatCoreError),
      meta: expect.any(Object),
    });
  });

  it('drop should abort all fetchDataHelpers and clear the map', () => {
    const mockFetchDataHelper = {
      localMessageID: 'test-id',
      abortSignal: {
        abort: vi.fn(),
        signal: {
          aborted: false,
        },
      },
    } as unknown as FetchDataHelper;

    httpChunk.fetchDataHelperMap.set('test-id', mockFetchDataHelper);
    httpChunk.drop();

    expect(mockFetchDataHelper.abortSignal.abort).toHaveBeenCalled();
    expect(httpChunk.fetchDataHelperMap.size).toBe(0);
  });

  it('handleMessageSuccess should emit ALL_SUCCESS and remove fetchDataHelper from map', () => {
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');
    const fetchDataHelper = new FetchDataHelper({ localMessageID: 'test-id' });

    httpChunk.fetchDataHelperMap.set('test-id', fetchDataHelper);
    httpChunk.handleMessageSuccess({ fetchDataHelper });

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.ALL_SUCCESS,
      expect.any(Object),
    );
    expect(httpChunk.fetchDataHelperMap.has('test-id')).toBe(false);
  });

  it('should emit MESSAGE_RECEIVED when message is valid', () => {
    const fetchDataHelper = { logID: 'log-123', setReplyID: vi.fn() };
    const validMessage = { message: { reply_id: 'reply-123' } };
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    vi.mocked(inValidChunkRaw).mockReturnValue(true);
    vi.mocked(getDataHelperPlaceholder).mockReturnValue(fetchDataHelper);

    const params = { message: { data: validMessage }, fetchDataHelper };

    httpChunk.handleMessage(params);

    expect(fetchDataHelper.setReplyID).toHaveBeenCalledWith('reply-123');
    expect(mockEmit).toHaveBeenCalledWith(HttpChunkEvents.MESSAGE_RECEIVED, {
      chunk: validMessage,
      logID: 'log-123',
    });
  });

  it('should emit INVALID_MESSAGE when message is invalid', () => {
    const fetchDataHelper = { logID: 'log-123', replyID: 'reply-123' };
    const invalidMessage = { data: 'invalid-data' };
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    vi.mocked(inValidChunkRaw).mockReturnValue(false);

    const params = { message: { data: invalidMessage }, fetchDataHelper };

    httpChunk.handleMessage(params);

    expect(mockEmit).toHaveBeenCalledWith(HttpChunkEvents.INVALID_MESSAGE, {
      logID: 'log-123',
      replyID: 'reply-123',
    });
  });
});

describe('pullMessage', () => {
  it('should emit FETCH_START event when fetch begins', async () => {
    const fetchDataHelper = new FetchDataHelper({
      localMessageID: 'local-123',
    });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onFetchStart({});
      return {};
    });
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    await httpChunk.pullMessage({
      value: {},
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: 'https://example.com',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.FETCH_START,
      getMessageLifecycleCallbackParam({}),
    );
  });

  it('should handle total fetch timeout correctly', async () => {
    const fetchDataHelper = new FetchDataHelper({
      localMessageID: 'local-123',
    });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onTotalFetchTimeout(fetchDataHelper);
      return {};
    });
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    await httpChunk.pullMessage({
      value: {},
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: 'https://example.com',
    });

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.TOTAL_FETCH_TIMEOUT,
      getMessageLifecycleCallbackParam(fetchDataHelper),
    );
  });

  it('should generate headers with Authorization when tokenManager provides an API key', async () => {
    const fetchDataHelper = new FetchDataHelper({
      localMessageID: 'local-123',
      headers: undefined,
    });
    const mockTokenManager1 = {
      getApiKeyAuthorizationValue: vi.fn().mockReturnValue('Bearer token'),
    };
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onTotalFetchTimeout(fetchDataHelper);
      return {};
    });
    const httpChunk1 = new HttpChunk({
      requestManager: {
        getSceneConfig: vi
          .fn()
          .mockReturnValue({ url: '/test-url', baseURL: '' }),
      },
      tokenManager: mockTokenManager1,
      reportLogWithScope: {},
    });
    await httpChunk1.pullMessage({
      value: {},
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: 'https://example.com',
      scene: RequestScene.SendMessage,
    });

    expect(fetchStream).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.arrayContaining([
          ['content-type', 'application/json'],
          ['Authorization', 'Bearer token'],
        ]),
      }),
    );
  });

  it('should handle fetchDataHelper with custom headers array', async () => {
    const fetchDataHelper = new FetchDataHelper({
      headers: [['custom-header', 'value']],
    });
    const mockTokenManager1 = {
      getApiKeyAuthorizationValue: vi.fn().mockReturnValue('Bearer token'),
    };
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onTotalFetchTimeout(fetchDataHelper);
      return {};
    });
    const httpChunk1 = new HttpChunk({
      requestManager: {},
      tokenManager: mockTokenManager1,
      reportLogWithScope: {},
    });
    await httpChunk1.pullMessage({
      value: {},
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: 'https://example.com',
      scene: RequestScene.SendMessage,
    });

    expect(fetchStream).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.arrayContaining([['custom-header', 'value']]),
      }),
    );
  });

  it('should default to content-type header when no custom headers are provided', async () => {
    const fetchDataHelper = new FetchDataHelper({ headers: undefined });
    const mockTokenManager1 = {
      getApiKeyAuthorizationValue: vi.fn().mockReturnValue(undefined),
    };
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onTotalFetchTimeout(fetchDataHelper);
      return {};
    });
    const httpChunk1 = new HttpChunk({
      requestManager: {},
      tokenManager: mockTokenManager1,
      reportLogWithScope: {},
    });
    await httpChunk1.pullMessage({
      value: {},
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: 'https://example.com',
      scene: RequestScene.SendMessage,
    });
    expect(fetchStream).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.arrayContaining([['content-type', 'application/json']]),
      }),
    );
  });

  it('should handle error by calling handleError when fetchStream encounters an error', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const mockError = new Error('mock error');
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onError(mockError);
      return {};
    });

    vi.spyOn(httpChunk as any, 'handleError');

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(httpChunk.handleError).toBeCalled();
  });

  it('should emit FETCH_START event on fetchStream start', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onFetchStart();
      return {};
    });
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    vi.spyOn(httpChunk as any, 'handleError');

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(mockEmit).toBeCalledWith(
      HttpChunkEvents.FETCH_START,
      expect.anything(),
    );
  });

  it('should emit FETCH_SUCCESS event on fetchStream onFetchSuccess', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onFetchSuccess();
      return {};
    });
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    vi.spyOn(httpChunk as any, 'handleError');

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(mockEmit).toBeCalledWith(
      HttpChunkEvents.FETCH_SUCCESS,
      expect.anything(),
    );
  });

  it('should emit READ_STREAM_START event on fetchStream onStartReadStream', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      options.onStartReadStream();
      return {};
    });
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    vi.spyOn(httpChunk as any, 'handleError');

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(mockEmit).toBeCalledWith(
      HttpChunkEvents.READ_STREAM_START,
      expect.anything(),
    );
  });

  it('validateMessage success', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    let sucResult = {};
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      sucResult = options.validateMessage({
        message: { event: 'someEvent', data: 'someData' },
      });
      return {};
    });

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(sucResult).toMatchObject({
      status: 'success',
    });
  });

  it('validateMessage fail', async () => {
    const mockFetchUrl = 'mock-url';
    const mockValue = { key: 'value' };
    const fetchDataHelper = new FetchDataHelper({ localMessageID: '123' });
    let sucResult = {};
    vi.mocked(fetchStream).mockImplementationOnce((url, options) => {
      sucResult = options.validateMessage({
        message: { event: ChunkEvent.ERROR, data: 'errorData' },
      });
      return {};
    });

    await httpChunk.pullMessage({
      value: mockValue,
      isRePullMessage: false,
      fetchDataHelper,
      fetchUrl: mockFetchUrl,
      scene: RequestScene.SendMessage,
    });
    expect(sucResult).toMatchObject({
      status: 'error',
      error: new Error('errorData'),
    });
  });
});

describe('handleError', () => {
  it('should emit FETCH_ERROR when error code is FetchException', () => {
    const errorInfo = {
      code: FetchStreamErrorCode.FetchException,
      message: 'Error occurred',
    };
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    httpChunk.handleError({ errorInfo });

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.FETCH_ERROR,
      errorInfo,
    );
  });

  it('should emit READ_STREAM_ERROR when error code is not FetchException', () => {
    const errorInfo = {
      code: 'SomeOtherError',
      message: 'Another error occurred',
    };
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    httpChunk.handleError({ errorInfo });

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.READ_STREAM_ERROR,
      errorInfo,
    );
  });
});

describe('handleBetweenChunkTimeout', () => {
  it('should emit BETWEEN_CHUNK_TIMEOUT', () => {
    const mockEmit = vi.spyOn(httpChunk, 'customEmit');

    httpChunk.handleBetweenChunkTimeout({});

    expect(mockEmit).toHaveBeenCalledWith(
      HttpChunkEvents.BETWEEN_CHUNK_TIMEOUT,
      expect.anything(),
    );
  });
});
