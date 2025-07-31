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

import { useRef, useState } from 'react';

import { expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';

import { useEventCallback } from '../src/hooks/use-event-callback';

it('get a fixed reference', () => {
  const print = vi.fn();
  const { result } = renderHook(() => {
    const [count, setCount] = useState(0);
    const fn = useEventCallback(print);
    const fnRef = useRef(fn);
    const isSame = fnRef.current === fn;
    const update = setCount;
    fn(count);
    return {
      isSame,
      update,
    };
  });

  act(() => {
    result.current.update(100);
  });
  expect(result.current.isSame).toBe(true);
  expect(print.mock.calls.length).toBe(2);
  expect(print.mock.calls[1][0]).toBe(100);

  act(() => {
    result.current.update(200);
  });
  expect(result.current.isSame).toBe(true);
  expect(print.mock.calls.length).toBe(3);
  expect(print.mock.calls[2][0]).toBe(200);
});
