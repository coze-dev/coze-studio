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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Canvas } from 'fabric';
import { renderHook, act } from '@testing-library/react';

import { useMousePosition } from '../../src/hooks/use-mouse-position';

describe('useMousePosition', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      on: vi.fn((event: string, callback: (event: any) => void) =>
        // Returns a cleaning function
        () => {
          mockCanvas.off(event, callback);
        },
      ),
      off: vi.fn(),
      getScenePoint: vi.fn(e => ({
        x: e.clientX,
        y: e.clientY,
      })),
    };
    return mockCanvas as unknown as Canvas;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回初始位置 {left: 0, top: 0}', () => {
    const { result } = renderHook(() =>
      useMousePosition({ canvas: undefined }),
    );
    expect(result.current.mousePosition).toEqual({ left: 0, top: 0 });
  });

  it('应该在没有 canvas 时不设置事件监听', () => {
    const mockCanvas = createMockCanvas();
    renderHook(() => useMousePosition({ canvas: undefined }));
    expect(mockCanvas.on).not.toHaveBeenCalled();
  });

  it('应该在有 canvas 时设置鼠标移动事件监听', () => {
    const mockCanvas = createMockCanvas();
    renderHook(() => useMousePosition({ canvas: mockCanvas }));
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'mouse:move',
      expect.any(Function),
    );
  });

  it('应该在鼠标移动时更新位置', () => {
    const mockCanvas = createMockCanvas();
    let moveCallback: (event: {
      e: { clientX: number; clientY: number };
    }) => void;

    const mockOn = vi.fn();
    Object.assign(mockCanvas, { on: mockOn });
    mockOn.mockImplementation((event: string, callback: any) => {
      if (event === 'mouse:move') {
        moveCallback = callback;
      }
      return () => {
        mockCanvas.off(event, callback);
      };
    });

    const { result } = renderHook(() =>
      useMousePosition({ canvas: mockCanvas }),
    );

    // initial position
    expect(result.current.mousePosition).toEqual({ left: 0, top: 0 });

    // Simulate mouse movement
    act(() => {
      moveCallback({
        e: { clientX: 100, clientY: 200 },
      });
    });

    expect(mockCanvas.getScenePoint).toHaveBeenCalledWith({
      clientX: 100,
      clientY: 200,
    });
    expect(result.current.mousePosition).toEqual({ left: 100, top: 200 });
  });

  it('应该在组件卸载时清理事件监听', () => {
    const mockCanvas = createMockCanvas();
    const cleanupSpy = vi.fn();
    const mockOn = vi.fn().mockReturnValue(cleanupSpy);
    Object.assign(mockCanvas, { on: mockOn });

    const { unmount } = renderHook(() =>
      useMousePosition({ canvas: mockCanvas }),
    );
    unmount();

    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('应该在 canvas 变化时重新设置事件监听', () => {
    const mockCanvas1 = createMockCanvas();
    const mockCanvas2 = createMockCanvas();
    const cleanupSpy = vi.fn();
    const mockOn = vi.fn().mockReturnValue(cleanupSpy);
    Object.assign(mockCanvas1, { on: mockOn });

    const { rerender } = renderHook(
      ({ canvas }) => useMousePosition({ canvas }),
      {
        initialProps: { canvas: mockCanvas1 },
      },
    );

    expect(mockCanvas1.on).toHaveBeenCalledWith(
      'mouse:move',
      expect.any(Function),
    );

    // Update canvas
    rerender({ canvas: mockCanvas2 });

    // Old event listeners should be cleaned up
    expect(cleanupSpy).toHaveBeenCalled();
    // New event listeners should be set up
    expect(mockCanvas2.on).toHaveBeenCalledWith(
      'mouse:move',
      expect.any(Function),
    );
  });
});
