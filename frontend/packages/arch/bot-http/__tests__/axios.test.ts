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

import MockAdapter from 'axios-mock-adapter';
import { AxiosError, isAxiosError } from 'axios';
import { redirect } from '@coze-arch/web-context';

import { emitAPIErrorEvent } from '../src/eventbus';
import { axiosInstance } from '../src/axios'; // your import path
import { ApiError, reportHttpError, ReportEventNames } from '../src/api-error';

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axiosInstance);

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    persist: {
      error: vi.fn(),
    },
  },
}));

vi.mock('../src/eventbus', () => ({
  emitAPIErrorEvent: vi.fn(),
  APIErrorEvent: {
    UNAUTHORIZED: 'unauthorized',
    COUNTRY_RESTRICTED: 'countryRestricted',
    COZE_TOKEN_INSUFFICIENT: 'cozeTokenInsufficient',
  },
}));
vi.mock('../src/api-error', async () => {
  const actual = (await vi.importActual('../src/api-error')) as any;

  return {
    ...actual,
    reportHttpError: vi.fn(),
  };
});

vi.mock('@coze-arch/web-context', () => ({
  redirect: vi.fn(),
}));

describe('axiosInstance', () => {
  beforeEach(() => {
    mock.reset();
    vi.clearAllMocks();
  });
  it('should fetch users', async () => {
    // Mock any GET request to /users
    // arguments for reply are (status, data, headers)
    mock.onGet('/users').reply(200, {
      code: 0,
      data: { users: [{ id: 1, name: 'John Smith' }] },
    });

    const response = await axiosInstance.get('/users');

    expect(response.status).toBe(200);
    expect(response.data.data.users[0].id).toBe(1);
  });

  it('should throw api errors if code not equal to zero', async () => {
    mock.onGet('/users').reply(200, {
      code: 1,
      msg: 'fake error',
    });

    await expect(() => axiosInstance.get('/users')).rejects.toThrowError(
      ApiError,
    );
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.ApiError,
      expect.any(ApiError),
    );
  });

  it('should emit special events when not login', async () => {
    mock.onGet('/users').reply(200, {
      // 700012006 => not login
      code: 700012006,
      msg: 'fake error',
    });

    await expect(axiosInstance.get('/users')).rejects.toThrow(ApiError);
    expect(emitAPIErrorEvent).toBeCalledWith(
      'unauthorized',
      expect.any(ApiError),
    );
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.ApiError,
      expect.any(ApiError),
    );

    mock.onGet('/users2').reply(200, {
      // 700012015 => COUNTRY_RESTRICTED
      code: 700012015,
      msg: 'fake error',
    });

    await expect(() => axiosInstance.get('/users2')).rejects.toThrowError(
      ApiError,
    );
    expect(emitAPIErrorEvent).toBeCalledWith(
      'countryRestricted',
      expect.any(ApiError),
    );
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.ApiError,
      expect.any(ApiError),
    );

    mock.onGet('/users4').reply(200, {
      // 702082020 => COZE_TOKEN_INSUFFICIENT
      code: 702082020,
      msg: 'fake error',
    });

    await expect(axiosInstance.get('/users4')).rejects.toThrow(ApiError);
    expect(emitAPIErrorEvent).toBeCalledWith(
      'cozeTokenInsufficient',
      expect.any(ApiError),
    );
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.ApiError,
      expect.any(ApiError),
    );

    mock.onGet('/users5').reply(200, {
      // 702095072 => COZE_TOKEN_INSUFFICIENT
      code: 702095072,
      msg: 'fake error',
    });

    await expect(axiosInstance.get('/users5')).rejects.toThrow(ApiError);
    expect(emitAPIErrorEvent).toBeCalledWith(
      'cozeTokenInsufficient',
      expect.any(ApiError),
    );
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.ApiError,
      expect.any(ApiError),
    );
  });

  it('should logger error when network error', async () => {
    mock.onGet('/users3').networkError();
    try {
      await expect(() => axiosInstance.get('/users3')).rejects.toThrow(Error);
    } catch (error) {
      expect(isAxiosError(error)).toBe(true);
      expect(reportHttpError).toBeCalledWith(
        ReportEventNames.NetworkError,
        expect.any(AxiosError),
      );
    }
  });

  it('should handle unauthorized response', async () => {
    mock.onGet('/users').reply(401, {
      code: 401,
      data: {
        redirect_uri: '/login',
      },
      message: 'Unauthorized',
    });

    await expect(() => axiosInstance.get('/users')).rejects.toThrowError(Error);
    expect(reportHttpError).toBeCalledWith(
      ReportEventNames.NetworkError,
      expect.any(Error),
    );

    expect(redirect).toBeCalledWith('/login');
  });

  it('should set content-type header for post request', async () => {
    mock.onPost('/api/mock').reply(200, {
      code: 0,
      data: {},
    });
    const response = await axiosInstance.post('/api/mock');
    expect(response.config.headers['Content-Type']).toBe('application/json');
    expect(response.config.data).toBe(JSON.stringify({}));
  });
  it('should set content-type header for get request', async () => {
    mock.onGet('/api/mock').reply(200, {
      code: 0,
      data: {},
    });
    const response = await axiosInstance.request({
      url: '/api/mock',
      method: 'GET',
    });
    expect(response.config.headers['Content-Type']).toBe('application/json');
  });
  it("won't override exist data", async () => {
    mock.onPost('/api/mock').reply(200, {
      code: 0,
      data: {},
    });
    const response = await axiosInstance.post('/api/mock', { data: '1' });
    expect(response.config.headers['Content-Type']).toBe('application/json');
    expect(response.config.data).toBe(JSON.stringify({ data: '1' }));
  });
  it("won't override exist content-type header", async () => {
    mock.onPost('/api/mock').reply(200, {
      code: 0,
      data: {},
    });
    const response = await axiosInstance.post('/api/mock', undefined, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    expect(response.config.headers['Content-Type']).toBe('text/plain');
  });
  it('should set handle object header', async () => {
    mock.onPost('/api/mock').reply(200, {
      code: 0,
      data: {},
    });

    axiosInstance.interceptors.request.use(config => {
      // @ts-expect-error just for test
      config.headers = { 'Content-Type': 'application/json' };
      return config;
    });
    const response = await axiosInstance.request({
      url: '/api/mock',
      method: 'POST',
    });
    expect(response.config.headers['Content-Type']).toBe('application/json');
  });
});
