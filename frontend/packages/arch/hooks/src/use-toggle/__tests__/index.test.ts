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

import { act, renderHook } from '@testing-library/react-hooks';
import useToggle from '../index';

describe('useToggle', () => {
  it('toggle values', () => {
    const hook = renderHook(() => useToggle());
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle(false);
    });
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle(true);
    });
    expect(hook.result.current.state).toBeTruthy();
  });

  it('default value', () => {
    const hook = renderHook(() => useToggle(true));
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.toggle(true);
    });
    expect(hook.result.current.state).toBeTruthy();
  });

  it('default non-boolean value', () => {
    const defaultValue = {};
    const hook = renderHook(() => useToggle(defaultValue));
    expect(hook.result.current.state).toBe(defaultValue);

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBe(false);

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBe(defaultValue);

    act(() => {
      hook.result.current.toggle(defaultValue);
    });
    expect(hook.result.current.state).toBe(defaultValue);
  });

  it('default non-boolean values', () => {
    enum Theme {
      Light = 0,
      Dark,
    }

    const hook = renderHook(() => useToggle<Theme>(Theme.Light, Theme.Dark));
    expect(hook.result.current.state).toBe(Theme.Light);

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBe(Theme.Dark);

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBe(Theme.Light);

    act(() => {
      hook.result.current.toggle(Theme.Light);
    });
    expect(hook.result.current.state).toBe(Theme.Light);

    act(() => {
      hook.result.current.toggle(Theme.Dark);
    });
    expect(hook.result.current.state).toBe(Theme.Dark);
  });
});
