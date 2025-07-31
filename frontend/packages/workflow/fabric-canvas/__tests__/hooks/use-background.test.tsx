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

import { useEffect } from 'react';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Canvas } from 'fabric';
import { renderHook, act } from '@testing-library/react';

import type { FabricSchema } from '../../src/typings';
import { Mode } from '../../src/typings';
import { useBackground } from '../../src/hooks/use-background';

// Mock ahooks
vi.mock('ahooks', () => ({
  useDebounceEffect: (fn: () => void, deps: any[], options: any) => {
    useEffect(() => {
      fn();
    }, deps);
  },
}));

describe('useBackground', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      backgroundColor: '#ffffff',
      set: vi.fn(),
      fire: vi.fn(),
      requestRenderAll: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockSchema = (backgroundColor = '#ffffff'): FabricSchema => ({
    width: 800,
    height: 600,
    background: backgroundColor,
    backgroundColor,
    objects: [],
    customVariableRefs: [],
    customType: Mode.RECT,
    customId: 'test-canvas',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('应该在 canvas 为 undefined 时不设置背景色', () => {
    const schema = createMockSchema();
    const { result } = renderHook(() =>
      useBackground({ canvas: undefined, schema }),
    );
    expect(result.current.backgroundColor).toBe('#ffffff');
  });

  it('应该在初始化时从 canvas 获取背景色', () => {
    const mockCanvas = createMockCanvas();
    const schema = createMockSchema();
    const { result } = renderHook(() =>
      useBackground({ canvas: mockCanvas, schema }),
    );
    expect(result.current.backgroundColor).toBe('#ffffff');
  });

  it('应该在 schema 的背景色变化时更新背景色', async () => {
    const mockCanvas = createMockCanvas();
    const initialSchema = createMockSchema('#ffffff');
    const { result, rerender } = renderHook(
      ({ currentSchema }) =>
        useBackground({ canvas: mockCanvas, schema: currentSchema }),
      {
        initialProps: { currentSchema: initialSchema },
      },
    );

    // Update schema
    const newSchema = createMockSchema('#000000');
    rerender({ currentSchema: newSchema });

    // Waiting to debounce
    await vi.runAllTimers();

    expect(result.current.backgroundColor).toBe('#000000');
    expect(mockCanvas.set).toHaveBeenCalledWith({
      backgroundColor: '#000000',
    });
    expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
    expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
  });

  it('应该在背景色变化时更新 canvas', () => {
    const mockCanvas = createMockCanvas();
    const schema = createMockSchema();
    const { result } = renderHook(() =>
      useBackground({ canvas: mockCanvas, schema }),
    );

    act(() => {
      result.current.setBackgroundColor('#000000');
    });

    expect(mockCanvas.set).toHaveBeenCalledWith({
      backgroundColor: '#000000',
    });
    expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
    expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
  });

  it('应该在背景色相同时不重复更新 canvas', () => {
    const mockCanvas = createMockCanvas();
    const schema = createMockSchema('#ffffff');
    const { result } = renderHook(() =>
      useBackground({ canvas: mockCanvas, schema }),
    );

    act(() => {
      result.current.setBackgroundColor('#ffffff');
    });

    expect(mockCanvas.set).not.toHaveBeenCalled();
    expect(mockCanvas.fire).not.toHaveBeenCalled();
    expect(mockCanvas.requestRenderAll).not.toHaveBeenCalled();
  });
});
