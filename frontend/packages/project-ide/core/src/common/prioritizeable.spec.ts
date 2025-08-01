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

import { describe, test, expect } from 'vitest';

import {
  compare,
  isValid,
  toPriority,
  prioritizeAll,
  toPrioritySync,
  prioritizeAllSync,
} from './prioritizeable';

describe('Priority', () => {
  test('Priority.compare', () => {
    expect(
      compare({ priority: 1, value: 1 }, { priority: 2, value: 1 }),
    ).toBeGreaterThan(0);
  });

  test('Priority.isValid', () => {
    expect(isValid({ priority: 1, value: 1 })).toBeTruthy();
    expect(isValid({ priority: 0, value: 1 })).toBeFalsy();
  });

  test('Priority.toPriority', async () => {
    expect(await toPriority(2, async () => 1)).toEqual({
      priority: 1,
      value: 2,
    });
    expect(await toPriority([2, 3], async () => 1)).toEqual([
      { priority: 1, value: 2 },
      { priority: 1, value: 3 },
    ]);
    expect(await prioritizeAll([2, 3], async () => 1)).toEqual([
      { priority: 1, value: 2 },
      { priority: 1, value: 3 },
    ]);
  });

  test('Priority.toPrioritySync', async () => {
    expect(await toPrioritySync([2, 3], () => 1)).toEqual([
      { priority: 1, value: 2 },
      { priority: 1, value: 3 },
    ]);
    expect(await prioritizeAllSync([2, 3], () => 1)).toEqual([
      { priority: 1, value: 2 },
      { priority: 1, value: 3 },
    ]);
  });
});
