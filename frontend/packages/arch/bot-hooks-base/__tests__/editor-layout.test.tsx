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

import { type PropsWithChildren } from 'react';

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  useLayoutContext,
  LayoutContext,
  PlacementEnum,
} from '../src/editor-layout';

describe('editor-layout', () => {
  const wrapper = ({
    children,
    placement = PlacementEnum.CENTER,
  }: PropsWithChildren<{ placement?: PlacementEnum }>) => (
    <LayoutContext value={{ placement }}>{children}</LayoutContext>
  );

  it('should use default center placement', () => {
    const { result } = renderHook(() => useLayoutContext());
    expect(result.current.placement).toBe(PlacementEnum.CENTER);
  });

  it('should use provided placement', () => {
    const { result } = renderHook(() => useLayoutContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, placement: PlacementEnum.LEFT }),
    });
    expect(result.current.placement).toBe(PlacementEnum.LEFT);
  });

  it('should use right placement', () => {
    const { result } = renderHook(() => useLayoutContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, placement: PlacementEnum.RIGHT }),
    });
    expect(result.current.placement).toBe(PlacementEnum.RIGHT);
  });
});
