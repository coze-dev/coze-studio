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

import { getSortedInputParameters } from '../get-sorted-input-parameters';

interface TestInputItem {
  name?: string;
  required?: boolean;
  id: number; // Additional property for stable sort testing if names are same
}

describe('getSortedInputParameters', () => {
  it('should return an empty array if inputs is null or undefined', () => {
    expect(getSortedInputParameters(null as any)).toEqual([]);
    expect(getSortedInputParameters(undefined as any)).toEqual([]);
  });

  it('should return an empty array if inputs is an empty array', () => {
    expect(getSortedInputParameters([])).toEqual([]);
  });

  it('should sort items with required=true before required=false', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'a', required: false },
      { id: 2, name: 'b', required: true },
    ];
    const expected: TestInputItem[] = [
      { id: 2, name: 'b', required: true },
      { id: 1, name: 'a', required: false },
    ];
    expect(getSortedInputParameters(inputs)).toEqual(expected);
  });

  it('should sort items by name within each required group (true then false)', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'z', required: false },
      { id: 2, name: 'a', required: true },
      { id: 3, name: 'x', required: false },
      { id: 4, name: 'b', required: true },
    ];
    const expected: TestInputItem[] = [
      { id: 2, name: 'a', required: true },
      { id: 4, name: 'b', required: true },
      { id: 3, name: 'x', required: false },
      { id: 1, name: 'z', required: false },
    ];
    expect(getSortedInputParameters(inputs)).toEqual(expected);
  });

  it('should treat items with undefined required as false by default', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'a' }, // required is undefined
      { id: 2, name: 'b', required: true },
    ];
    const expected: TestInputItem[] = [
      { id: 2, name: 'b', required: true },
      { id: 1, name: 'a', required: false }, // Processed to required: false
    ];
    expect(getSortedInputParameters(inputs)).toEqual(expected);
  });

  it('should handle items with undefined names (they should be sorted according to lodash sortBy behavior)', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'a', required: true },
      { id: 2, required: true }, // name is undefined
      { id: 3, name: 'b', required: false },
      { id: 4, required: false }, // name is undefined
    ];
    // Lodash sortBy typically places undefined values first when sorting in ascending order.
    const expected: TestInputItem[] = [
      { id: 1, name: 'a', required: true },
      { id: 2, required: true },
      { id: 3, name: 'b', required: false },
      { id: 4, required: false },
    ];
    expect(getSortedInputParameters(inputs)).toEqual(expected);
  });

  it('should maintain original properties of items', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'a', required: false, otherProp: 'value1' } as any,
      { id: 2, name: 'b', required: true, otherProp: 'value2' } as any,
    ];
    const result = getSortedInputParameters(inputs);
    expect(result[0]).toHaveProperty('otherProp', 'value2');
    expect(result[1]).toHaveProperty('otherProp', 'value1');
  });

  it('should use custom groupKey and sortKey if provided (though the function signature does not expose this)', () => {
    const inputs: TestInputItem[] = [
      { id: 1, name: 'a', required: false },
      { id: 2, name: 'b', required: true },
    ];
    const expected: TestInputItem[] = [
      { id: 2, name: 'b', required: true },
      { id: 1, name: 'a', required: false },
    ];
    expect(getSortedInputParameters(inputs, 'required', 'name')).toEqual(
      expected,
    );
  });
});
