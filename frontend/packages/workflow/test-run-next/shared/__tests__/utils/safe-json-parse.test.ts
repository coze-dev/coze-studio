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

import { safeJsonParse } from '../../src/utils/safe-json-parse';

describe('utils-safe-json-parse', () => {
  // Test parsing JSON string normally
  it('should parse valid JSON string', () => {
    const jsonString = '{"key": "value"}';
    const result = safeJsonParse(jsonString);
    expect(result).toEqual({ key: 'value' });
  });

  // Test parsing invalid JSON string
  it('should return undefined when parsing invalid JSON string', () => {
    const invalidJsonString = '{key: "value"}';
    const result = safeJsonParse(invalidJsonString);
    expect(result).toBeUndefined();
  });

  // Test empty string input
  it('should return emptyValue when input is an empty string', () => {
    const emptyString = '';
    const emptyValue = {};
    const result = safeJsonParse(emptyString, { emptyValue });
    expect(result).toBe(emptyValue);
  });

  it('should return object when input is an empty object', () => {
    const value = {};
    expect(safeJsonParse(value)).toBe(value);
  });
});
