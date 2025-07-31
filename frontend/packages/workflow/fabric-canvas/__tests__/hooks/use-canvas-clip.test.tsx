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
import { type Canvas, Rect } from 'fabric';
import { renderHook, act } from '@testing-library/react';

import type { FabricSchema } from '../../src/typings';
import { Mode } from '../../src/typings';
import { useCanvasClip } from '../../src/hooks/use-canvas-clip';

// Mock fabric
vi.mock('fabric', () => ({
  Rect: vi.fn(),
}));

describe('useCanvasClip', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      clipPath: undefined,
      requestRenderAll: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockSchema = (): FabricSchema => ({
    width: 800,
    height: 600,
    background: '#ffffff',
    backgroundColor: '#ffffff',
    objects: [],
    customVariableRefs: [],
    customType: Mode.RECT,
    customId: 'test-canvas',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addClip', () => {
    it('应该在 canvas 为 undefined 时不执行任何操作', () => {
      const schema = createMockSchema();
      const { result } = renderHook(() =>
        useCanvasClip({ canvas: undefined, schema }),
      );

      act(() => {
        result.current.addClip();
      });

      expect(Rect).not.toHaveBeenCalled();
    });

    it('应该正确添加裁剪区域', () => {
      const mockCanvas = createMockCanvas();
      const schema = createMockSchema();
      const mockRect = {};
      (Rect as any).mockReturnValue(mockRect);

      const { result } = renderHook(() =>
        useCanvasClip({ canvas: mockCanvas, schema }),
      );

      act(() => {
        result.current.addClip();
      });

      expect(Rect).toHaveBeenCalledWith({
        absolutePositioned: true,
        top: 0,
        left: 0,
        width: schema.width,
        height: schema.height,
      });
      expect(mockCanvas.clipPath).toBe(mockRect);
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('removeClip', () => {
    it('应该在 canvas 为 undefined 时不执行任何操作', () => {
      const schema = createMockSchema();
      const { result } = renderHook(() =>
        useCanvasClip({ canvas: undefined, schema }),
      );

      act(() => {
        result.current.removeClip();
      });
    });

    it('应该正确移除裁剪区域', () => {
      const mockCanvas = createMockCanvas();
      const schema = createMockSchema();
      const { result } = renderHook(() =>
        useCanvasClip({ canvas: mockCanvas, schema }),
      );

      // Add the clipping area first
      act(() => {
        result.current.addClip();
      });

      // Remove clipping area
      act(() => {
        result.current.removeClip();
      });

      expect(mockCanvas.clipPath).toBeUndefined();
      expect(mockCanvas.requestRenderAll).toHaveBeenCalledTimes(2);
    });
  });
});
