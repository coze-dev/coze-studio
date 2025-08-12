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

import {
  act,
  renderHook,
  type RenderHookResult,
} from '@testing-library/react-hooks';
import { useState } from 'react';
import usePersistCallback from '..';

// The function changes, but the address remains the same

const TestHooks = () => {
  const [count, setCount] = useState(0);

  const addCount = () => {
    setCount(c => c + 1);
  };
  const persistFn = usePersistCallback(() => count);

  return { addCount, persistFn };
};

let hook: RenderHookResult<[], ReturnType<typeof TestHooks>>;

describe('usePersistCallback', () => {
  it('usePersistCallback should work', () => {
    act(() => {
      hook = renderHook(() => TestHooks());
    });
    const currentFn = hook.result.current.persistFn;
    expect(hook.result.current.persistFn()).toEqual(0);

    act(() => {
      hook.result.current.addCount();
    });

    expect(currentFn).toEqual(hook.result.current.persistFn);
    expect(hook.result.current.persistFn()).toEqual(1);
  });
});
