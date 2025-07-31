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

import { getReportError } from '../src/get-report-error';

describe('getReportError', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('common error', () => {
    const error = new Error('123');
    const result = getReportError(error, 'testError');
    expect(result).toMatchObject({ error, meta: { reason: 'testError' } });
  });

  test('stringify error', () => {
    const result = getReportError('123', 'testError');
    expect(result).toMatchObject({
      error: new Error('123'),
      meta: { reason: 'testError' },
    });
  });

  test('object error', () => {
    const result = getReportError(
      { foo: 'bar', reason: 'i am fool' },
      'testError',
    );
    expect(result).toMatchObject({
      error: new Error(''),
      meta: { reason: 'testError', reasonOfInputError: 'i am fool' },
    });
  });
});
