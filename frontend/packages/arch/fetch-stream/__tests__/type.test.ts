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

import { describe, it, expect } from 'vitest';

import { FetchStreamErrorCode, type ValidateResult } from '../src/type';

describe('type definitions', () => {
  describe('FetchStreamErrorCode', () => {
    it('应该包含正确的错误码', () => {
      expect(FetchStreamErrorCode.FetchException).toBe(10001);
      expect(FetchStreamErrorCode.HttpChunkStreamingException).toBe(10002);
    });
  });

  describe('ValidateResult', () => {
    it('应该支持成功状态', () => {
      const successResult: ValidateResult = { status: 'success' };
      expect(successResult.status).toBe('success');
    });

    it('应该支持错误状态', () => {
      const errorResult: ValidateResult = {
        status: 'error',
        error: new Error('Test error'),
      };
      expect(errorResult.status).toBe('error');
      expect(errorResult.error).toBeInstanceOf(Error);
    });
  });
});
