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

import { isFormSchemaPropertyEmpty } from '../../src/utils/is-property-empty';

describe('isFormSchemaPropertyEmpty', () => {
  // Test an empty object
  it('should return true for an empty object', () => {
    const emptyObject = {};
    expect(isFormSchemaPropertyEmpty(emptyObject)).toBe(true);
  });

  // Testing non-empty objects
  it('should return false for a non-empty object', () => {
    const nonEmptyObject = { key: 'value' };
    expect(isFormSchemaPropertyEmpty(nonEmptyObject)).toBe(false);
  });

  // Testing non-object values
  it('should return true for non-object values', () => {
    const values = [null, undefined, 123, 'string', true, false, []];
    values.forEach(value => {
      expect(isFormSchemaPropertyEmpty(value)).toBe(true);
    });
  });
});
