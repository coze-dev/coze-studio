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
import { type Canvas, type FabricObject } from 'fabric';
import { renderHook, act } from '@testing-library/react';

import { useAlign } from '../../src/hooks/use-align';

describe('useAlign', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      getActiveObject: vi.fn(),
      fire: vi.fn(),
      requestRenderAll: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockObject = (props = {}) => {
    const mockObject = {
      set: vi.fn(),
      setCoords: vi.fn(),
      getBoundingRect: vi.fn(() => ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        ...props,
      })),
      width: 100,
      height: 100,
      ...props,
    };
    return mockObject as unknown as FabricObject;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('alignLeft', () => {
    it('应该在 canvas 为 undefined 时不执行任何操作', () => {
      const { result } = renderHook(() => useAlign({ canvas: undefined }));
      act(() => {
        result.current.alignLeft();
      });
      // Since there is no canvas, no operation should occur
    });

    it('应该在选中对象少于 2 个时不执行任何操作', () => {
      const mockCanvas = createMockCanvas();
      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: [createMockObject()] }),
      );
      act(() => {
        result.current.alignLeft();
      });
      expect(mockCanvas.fire).not.toHaveBeenCalled();
    });

    it('应该正确执行左对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignLeft();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          left: -mockActiveObject.width / 2,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('alignRight', () => {
    it('应该正确执行右对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignRight();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          left: mockActiveObject.width / 2 - obj.getBoundingRect().width,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('alignCenter', () => {
    it('应该正确执行水平居中对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignCenter();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          left: -obj.getBoundingRect().width / 2,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('alignTop', () => {
    it('应该正确执行顶部对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignTop();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          top: -mockActiveObject.height / 2,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('alignMiddle', () => {
    it('应该正确执行垂直居中对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignMiddle();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          top: -obj.getBoundingRect().height / 2,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('alignBottom', () => {
    it('应该正确执行底部对齐', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject();
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.alignBottom();
      });

      mockObjects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith({
          top: mockActiveObject.height / 2 - obj.getBoundingRect().height,
        });
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('verticalAverage', () => {
    it('应该正确执行水平均分', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject({ width: 300 });
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.verticalAverage();
      });

      expect(mockObjects[0].set).toHaveBeenCalledWith({ left: -150 });
      expect(mockObjects[1].set).toHaveBeenCalledWith({ left: -50 });
      expect(mockObjects[2].set).toHaveBeenCalledWith({ left: 50 });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('horizontalAverage', () => {
    it('应该正确执行垂直均分', () => {
      const mockCanvas = createMockCanvas();
      const mockActiveObject = createMockObject({ height: 300 });
      const mockObjects = [
        createMockObject(),
        createMockObject(),
        createMockObject(),
      ];
      (mockCanvas.getActiveObject as any).mockReturnValue(mockActiveObject);

      const { result } = renderHook(() =>
        useAlign({ canvas: mockCanvas, selectObjects: mockObjects }),
      );

      act(() => {
        result.current.horizontalAverage();
      });

      expect(mockObjects[0].set).toHaveBeenCalledWith({ top: -150 });
      expect(mockObjects[1].set).toHaveBeenCalledWith({ top: -50 });
      expect(mockObjects[2].set).toHaveBeenCalledWith({ top: 50 });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });
});
