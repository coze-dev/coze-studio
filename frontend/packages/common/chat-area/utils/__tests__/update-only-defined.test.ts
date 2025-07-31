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

import { expect, it, vi } from 'vitest';

import { updateOnlyDefined } from '../src/update-only-defined';

it('update only defined', () => {
  const updater = vi.fn();
  updateOnlyDefined(updater, {
    a: undefined,
    b: 1,
  });
  expect(updater.mock.calls[0][0]).toMatchObject({
    b: 1,
  });
});

it('do not run updater if item value is only undefined', () => {
  const updater = vi.fn();
  updateOnlyDefined(updater, {
    a: undefined,
    b: undefined,
  });
  expect(updater.mock.calls.length).toBe(0);
});
