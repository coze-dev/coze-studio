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

import { ErrorType } from '../src/types';
import {
  safeJson,
  ApiError,
  getErrorType,
  getApiErrorRecord,
} from '../src/slardar/utils';

describe('slardar utils function is normal', () => {
  test('safeJson stringify and parse success catch error', () => {
    const mock = {
      test: {},
    };
    mock.test = mock;

    expect(safeJson.stringify(mock)).toContain('JSON stringify Error:');

    expect(safeJson.parse('{')).toBeNull();
  });

  test('ApiError', () => {
    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
    });
    expect(apiError.name).toBe('ApiError');
  });

  test('getErrorType', () => {
    const errorType = getErrorType({
      name: '',
      message: '',
    });
    expect(errorType).toBe(ErrorType.Unknown);

    const errorType1 = getErrorType(null);
    expect(errorType1).toBe(ErrorType.Unknown);

    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
    });
    const errorType2 = getErrorType(apiError);
    expect(errorType2).toBe(ErrorType.ApiError);

    const apiError2 = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
      errorType: 'test',
    });

    const errorType3 = getErrorType(apiError2);
    expect(errorType3).toBe('test');
  });

  test('getApiErrorRecord', () => {
    const error1 = getApiErrorRecord(null);
    expect(error1).toEqual({});

    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
      response: {},
      requestConfig: {},
    });
    const error2 = getApiErrorRecord(apiError);
    expect(error2.response).toBe('{}');
  });
});
