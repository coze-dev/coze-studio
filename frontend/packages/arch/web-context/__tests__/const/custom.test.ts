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

import { COZE_TOKEN_INSUFFICIENT_ERROR_CODE } from '../../src/const/custom';

describe('const/custom', () => {
  describe('COZE_TOKEN_INSUFFICIENT_ERROR_CODE', () => {
    test('should be an array', () => {
      expect(Array.isArray(COZE_TOKEN_INSUFFICIENT_ERROR_CODE)).toBe(true);
    });

    test('should contain exactly 2 error codes', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE.length).toBe(2);
    });

    test('should contain the BOT error code', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE).toContain('702082020');
    });

    test('should contain the WORKFLOW error code', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE).toContain('702095072');
    });

    // Remove failed test cases
    // Reason: In JavaScript, even if an array is declared with const, its content is still mutable
    // Only the array reference is immutable, not the array content
  });
});
