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

import React from 'react';

import { renderHook, act } from '@testing-library/react-hooks';

import { useBackgroundScroll } from '../../src/hooks/uikit/use-background-scroll';

vi.mock('../../src/hooks/public/use-show-bgackground', () => ({
  useShowBackGround: () => true,
}));
describe('useBackgroundScroll', () => {
  it('should update showGradient state correctly', () => {
    const maskNode = React.createElement('div');
    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        styles: { a: 'ss' },
        maskNode,
      }),
    );

    expect(result.current.showGradient).toBe(true);

    act(() => {
      result.current.onReachTop();
    });

    expect(result.current.showGradient).toBe(false);
    expect(result.current.beforeNode).toBe(null);

    act(() => {
      result.current.onLeaveTop();
    });

    expect(result.current.showGradient).toBe(true);
    expect(result.current.beforeNode).toBe(maskNode);
  });

  it('should update beforeClassName correctly', () => {
    const maskNode = React.createElement('div');

    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        maskNode,
        styles: { 'scroll-mask': 'mask-class' },
      }),
    );

    expect(result.current.beforeClassName).toBe('absolute left-0');
  });

  it('should update maskClass correctly', () => {
    const maskNode = React.createElement('div');

    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        maskNode,
        styles: { 'scroll-mask': 'mask-class' },
      }),
    );

    expect(result.current.maskClassName).toBe('mask-class');
  });
});
