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

import { renderHook, act } from '@testing-library/react-hooks';
import useBoolean from '../index';

describe('useBoolean', () => {
  it('uses methods', () => {
    const hook = renderHook(() => useBoolean());
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.setFalse();
    });
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.setTrue();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.toggle(true);
    });
    expect(hook.result.current.state).toBeTruthy();
  });

  it('uses defaultValue', () => {
    const hook = renderHook(() => useBoolean(true));
    expect(hook.result.current.state).toBeTruthy();
  });
});
