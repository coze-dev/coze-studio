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

import { type AxiosError, AxiosHeaders } from 'axios';
import { logger } from '@coze-arch/logger';

import {
  reportHttpError,
  ReportEventNames,
  ApiError,
  isApiError,
} from '../src/api-error';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    persist: {
      error: vi.fn(),
    },
  },
}));
describe('reportHttpError', () => {
  const error: AxiosError = {
    response: {
      data: {
        code: '500',
        msg: 'Internal Server Error',
      },
      status: 500,
      statusText: '',
      config: {
        headers: new AxiosHeaders(),
      },
      headers: {
        'x-tt-logid': '1234567890',
      },
    },
    config: {
      method: 'GET',
      headers: new AxiosHeaders(),
      url: '/users',
    },
    message: 'Request failed with status code 500',
    name: 'AxiosError',
    isAxiosError: true,
    toJSON: () => ({}),
  };
  it('if no response data, should report http error', () => {
    const eventName = ReportEventNames.ApiError;
    const noResponseError: AxiosError = {
      response: {
        data: {
          code: '',
        },
        status: 500,
        statusText: '',
        config: {
          headers: new AxiosHeaders(),
        },
        headers: {
          'x-tt-logid': '1234567890',
        },
      },
      config: {
        method: 'GET',
        headers: new AxiosHeaders(),
        url: '/users',
      },
      message: 'Request failed with status code 500',
      name: 'AxiosError',
      isAxiosError: true,
      toJSON: () => ({}),
    };

    reportHttpError(eventName, noResponseError);

    expect(logger.persist.error).toBeCalledWith({
      eventName,
      error: noResponseError,
      meta: {
        message: error.message,
        name: error.name,
        httpStatusCode: '500',
        httpMethod: 'GET',
        urlPath: '/users',
        logId: '1234567890',
        customErrorCode: '',
        customErrorMsg: '',
      },
    });
  });

  it('should report http error', () => {
    const eventName = ReportEventNames.ApiError;

    reportHttpError(eventName, error);

    expect(logger.persist.error).toHaveBeenCalledWith({
      eventName,
      error,
      meta: {
        message: error.message,
        name: error.name,
        httpStatusCode: '500',
        httpMethod: 'GET',
        urlPath: '/users',
        logId: '1234567890',
        customErrorCode: '500',
        customErrorMsg: 'Internal Server Error',
      },
    });
  });

  it('should handle error when reporting http catch', () => {
    const eventName = ReportEventNames.ApiError;

    (logger.persist.error as any).mockImplementation(() => {
      throw new Error('Failed to persist error');
    });

    expect(() => {
      reportHttpError(eventName, error);
    }).toThrowError('Failed to persist error');
  });
});

describe('isApiError', () => {
  it('should return true if error is an instance of ApiError', () => {
    const error = new ApiError('500', 'Internal Server Error', {
      data: {},
      status: 500,
      statusText: 'Internal Server Error',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders(),
      },
    });
    const result = isApiError(error);
    expect(result).toBe(true);
  });

  it('should return false if error is not an instance of ApiError', () => {
    const error = new Error('OtherError');
    const result = isApiError(error);
    expect(result).toBe(false);
  });
});
