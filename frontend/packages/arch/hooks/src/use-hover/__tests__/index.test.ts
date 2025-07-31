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

import useHover from '../index';

describe('useHover', () => {
  it('test div element ref', () => {
    const target = document.createElement('div');
    const handleEnter = vi.fn();
    const handleLeave = vi.fn();
    const hook = renderHook(() =>
      useHover(target, {
        onEnter: handleEnter,
        onLeave: handleLeave,
      }),
    );
    expect(hook.result.current[1]).toBe(false);

    act(() => {
      target.dispatchEvent(new Event('mouseenter'));
    });
    expect(hook.result.current[1]).toBe(true);
    expect(handleEnter).toBeCalledTimes(1);

    act(() => {
      target.dispatchEvent(new Event('mouseleave'));
    });
    expect(hook.result.current[1]).toBe(false);
    expect(handleLeave).toBeCalledTimes(1);
    hook.unmount();
  });
});
