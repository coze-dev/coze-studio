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

import { isApiError } from '../../src/utils/handle-error';

describe('isApiError', () => {
  it('identifies ApiError correctly', () => {
    const error = { name: 'ApiError' };
    const result = isApiError(error);
    expect(result).to.be.true;
  });

  it('returns false for non-ApiError', () => {
    const error = { name: 'OtherError' };
    const result = isApiError(error);
    expect(result).to.be.false;
  });

  it('returns false for error without name', () => {
    const error = { message: 'An error occurred' };
    const result = isApiError(error);
    expect(result).to.be.false;
  });

  it('handles null and undefined', () => {
    expect(isApiError(null)).to.be.false;
    expect(isApiError(undefined)).to.be.false;
  });
});
