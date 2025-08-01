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
import { renderHook } from '@testing-library/react';

import { createSnap, snap } from '../../src/utils/snap/snap';
import type { SnapService } from '../../src/utils/snap/snap';
import { useSnapMove } from '../../src/hooks/use-snap-move';

// Mock snap utils
vi.mock('../../src/utils/snap/snap', () => ({
  createSnap: vi.fn(() => ({
    move: vi.fn(),
    reset: vi.fn(),
    destroy: vi.fn(),
    helpline: {
      resetScale: vi.fn(),
    },
    canvas: null,
    threshold: 5,
    rules: [],
    snapX: vi.fn(),
    snapY: vi.fn(),
    snapPoints: [],
    snapLines: [],
    snapObjects: [],
    snapToObjects: vi.fn(),
    snapToPoints: vi.fn(),
  })),
  snap: {
    resetAllObjectsPosition: vi.fn(),
    helpline: {
      resetScale: vi.fn(),
    },
  },
}));

describe('useSnapMove', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      on: vi.fn((event: string, callback: (event: any) => void) =>
        // Returns a cleaning function
        () => {
          mockCanvas.off(event, callback);
        },
      ),
      off: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在没有 canvas 时不设置事件监听', () => {
    renderHook(() =>
      useSnapMove({
        canvas: undefined,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );
    expect(createSnap).not.toHaveBeenCalled();
  });

  it('应该正确初始化 snap 功能', () => {
    const mockCanvas = createMockCanvas();
    renderHook(() =>
      useSnapMove({
        canvas: mockCanvas,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );

    expect(createSnap).toHaveBeenCalledWith(mockCanvas, 'test-layer', 1);
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'mouse:down',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'mouse:up',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:moving',
      expect.any(Function),
    );
  });

  it('应该在鼠标按下时重置所有对象位置', () => {
    const mockCanvas = createMockCanvas();
    renderHook(() =>
      useSnapMove({
        canvas: mockCanvas,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );

    // Get the callback function for the mouse: down event
    const mouseDownCallback = (mockCanvas.on as any).mock.calls.find(
      (call: [string, Function]) => call[0] === 'mouse:down',
    )?.[1];

    // simulated event firing
    mouseDownCallback?.({ target: { id: 'test-object' } });

    expect(snap.resetAllObjectsPosition).toHaveBeenCalledWith({
      id: 'test-object',
    });
  });

  it('应该在鼠标松开时重置 snap', () => {
    const mockCanvas = createMockCanvas();
    const mockSnap = {
      move: vi.fn(),
      reset: vi.fn(),
      destroy: vi.fn(),
      helpline: {
        resetScale: vi.fn(),
      },
      canvas: null,
      threshold: 5,
      rules: [],
      snapX: vi.fn(),
      snapY: vi.fn(),
      snapPoints: [],
      snapLines: [],
      snapObjects: [],
      snapToObjects: vi.fn(),
      snapToPoints: vi.fn(),
    } as unknown as SnapService;
    vi.mocked(createSnap).mockReturnValue(mockSnap);

    renderHook(() =>
      useSnapMove({
        canvas: mockCanvas,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );

    // Get the callback function for the mouse: up event
    const mouseUpCallback = (mockCanvas.on as any).mock.calls.find(
      (call: [string, Function]) => call[0] === 'mouse:up',
    )?.[1];

    // simulated event firing
    mouseUpCallback?.({ target: { id: 'test-object' } });

    expect(mockSnap.reset).toHaveBeenCalled();
  });

  it('应该在对象移动时调用 snap.move', () => {
    const mockCanvas = createMockCanvas();
    const mockSnap = {
      move: vi.fn(),
      reset: vi.fn(),
      destroy: vi.fn(),
      helpline: {
        resetScale: vi.fn(),
      },
      canvas: null,
      threshold: 5,
      rules: [],
      snapX: vi.fn(),
      snapY: vi.fn(),
      snapPoints: [],
      snapLines: [],
      snapObjects: [],
      snapToObjects: vi.fn(),
      snapToPoints: vi.fn(),
    } as unknown as SnapService;
    vi.mocked(createSnap).mockReturnValue(mockSnap);

    renderHook(() =>
      useSnapMove({
        canvas: mockCanvas,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );

    // Get the callback function for the object: moving event
    const movingCallback = (mockCanvas.on as any).mock.calls.find(
      (call: [string, Function]) => call[0] === 'object:moving',
    )?.[1];

    // simulated event firing
    movingCallback?.({ target: { id: 'test-object' } });

    expect(mockSnap.move).toHaveBeenCalledWith({ id: 'test-object' });
  });

  it('应该在组件卸载时销毁 snap', () => {
    const mockCanvas = createMockCanvas();
    const mockSnap = {
      move: vi.fn(),
      reset: vi.fn(),
      destroy: vi.fn(),
      helpline: {
        resetScale: vi.fn(),
      },
      canvas: null,
      threshold: 5,
      rules: [],
      snapX: vi.fn(),
      snapY: vi.fn(),
      snapPoints: [],
      snapLines: [],
      snapObjects: [],
      snapToObjects: vi.fn(),
      snapToPoints: vi.fn(),
    } as unknown as SnapService;
    vi.mocked(createSnap).mockReturnValue(mockSnap);

    const { unmount } = renderHook(() =>
      useSnapMove({
        canvas: mockCanvas,
        helpLineLayerId: 'test-layer',
        scale: 1,
      }),
    );

    unmount();

    expect(mockSnap.destroy).toHaveBeenCalled();
  });

  it('应该在 scale 变化时重置辅助线比例', () => {
    const mockCanvas = createMockCanvas();

    const { rerender } = renderHook(
      ({ scale }) =>
        useSnapMove({
          canvas: mockCanvas,
          helpLineLayerId: 'test-layer',
          scale,
        }),
      {
        initialProps: { scale: 1 },
      },
    );

    // Update scale
    rerender({ scale: 2 });

    expect(snap.helpline.resetScale).toHaveBeenCalledWith(2);
  });
});
