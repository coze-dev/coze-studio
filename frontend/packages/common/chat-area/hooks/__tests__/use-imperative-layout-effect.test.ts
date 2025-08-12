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
import { act, renderHook } from '@testing-library/react-hooks';

import { useImperativeLayoutEffect } from '../src/hooks/use-imperative-layout-effect';

it('run after layout effect', () => {
  const fn = vi.fn();
  const { result } = renderHook(() => useImperativeLayoutEffect(fn));
  expect(fn.mock.calls.length).toBe(0);
  act(() => {
    result.current(22);
    expect(fn.mock.calls.length).toBe(0);
  });
  expect(fn.mock.calls.length).toBe(1);
  expect(fn.mock.calls[0][0]).toBe(22);
});
