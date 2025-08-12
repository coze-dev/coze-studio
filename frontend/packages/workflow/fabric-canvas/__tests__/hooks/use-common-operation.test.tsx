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

import { useCommonOperation } from '../../src/hooks/use-common-operation';

describe('useCommonOperation', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      getActiveObject: vi.fn(),
      getActiveObjects: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      remove: vi.fn(),
      bringObjectToFront: vi.fn(),
      sendObjectToBack: vi.fn(),
      bringObjectForward: vi.fn(),
      sendObjectBackwards: vi.fn(),
      setWidth: vi.fn(),
      setHeight: vi.fn(),
      fire: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockObject = (props = {}) => {
    const mockObject = {
      isType: vi.fn(),
      fire: vi.fn(),
      set: vi.fn(),
      left: 100,
      top: 100,
      ...props,
    };
    return mockObject as unknown as FabricObject;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('moveActiveObject', () => {
    it('应该在 canvas 为 undefined 时不执行任何操作', () => {
      const { result } = renderHook(() =>
        useCommonOperation({ canvas: undefined }),
      );

      act(() => {
        result.current.moveActiveObject('left');
      });
    });

    it('应该正确移动单个对象', () => {
      const mockCanvas = createMockCanvas();
      const mockObject = createMockObject();
      (mockObject.isType as any).mockReturnValue(false);
      (mockCanvas.getActiveObject as any).mockReturnValue(mockObject);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveActiveObject('left', 10);
      });

      expect(mockObject.set).toHaveBeenCalledWith({ left: 90 });
      expect(mockObject.fire).toHaveBeenCalledWith('moving', {
        target: mockObject,
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确移动选中组', () => {
      const mockCanvas = createMockCanvas();
      const mockObject = createMockObject();
      (mockObject.isType as any).mockReturnValue(true);
      (mockCanvas.getActiveObject as any).mockReturnValue(mockObject);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveActiveObject('right', 10);
      });

      expect(mockObject.set).toHaveBeenCalledWith({ left: 110 });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:moving', {
        target: mockObject,
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('discardActiveObject', () => {
    it('应该正确取消选中对象', () => {
      const mockCanvas = createMockCanvas();
      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.discardActiveObject();
      });

      expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('removeActiveObjects', () => {
    it('应该正确移除选中的对象', () => {
      const mockCanvas = createMockCanvas();
      const mockObjects = [createMockObject(), createMockObject()];
      (mockCanvas.getActiveObjects as any).mockReturnValue(mockObjects);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.removeActiveObjects();
      });

      mockObjects.forEach(obj => {
        expect(mockCanvas.remove).toHaveBeenCalledWith(obj);
      });
      expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('moveTo', () => {
    it('应该正确将对象移动到最前', () => {
      const mockCanvas = createMockCanvas();
      const mockObjects = [createMockObject(), createMockObject()];
      (mockCanvas.getActiveObjects as any).mockReturnValue(mockObjects);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveTo('front');
      });

      mockObjects.forEach(obj => {
        expect(mockCanvas.bringObjectToFront).toHaveBeenCalledWith(obj);
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified-zIndex');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确将对象移动到最后', () => {
      const mockCanvas = createMockCanvas();
      const mockObjects = [createMockObject(), createMockObject()];
      (mockCanvas.getActiveObjects as any).mockReturnValue(mockObjects);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveTo('backend');
      });

      mockObjects.forEach(obj => {
        expect(mockCanvas.sendObjectToBack).toHaveBeenCalledWith(obj);
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified-zIndex');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确将对象向前移动一层', () => {
      const mockCanvas = createMockCanvas();
      const mockObjects = [createMockObject(), createMockObject()];
      (mockCanvas.getActiveObjects as any).mockReturnValue(mockObjects);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveTo('front-one');
      });

      mockObjects.forEach(obj => {
        expect(mockCanvas.bringObjectForward).toHaveBeenCalledWith(obj);
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified-zIndex');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确将对象向后移动一层', () => {
      const mockCanvas = createMockCanvas();
      const mockObjects = [createMockObject(), createMockObject()];
      (mockCanvas.getActiveObjects as any).mockReturnValue(mockObjects);

      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.moveTo('backend-one');
      });

      mockObjects.forEach(obj => {
        expect(mockCanvas.sendObjectBackwards).toHaveBeenCalledWith(obj);
      });
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified-zIndex');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });

  describe('resetWidthHeight', () => {
    it('应该正确重置画布宽度', () => {
      const mockCanvas = createMockCanvas();
      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.resetWidthHeight({ width: 800 });
      });

      expect(mockCanvas.setWidth).toHaveBeenCalledWith(800);
      expect(mockCanvas.setHeight).not.toHaveBeenCalled();
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确重置画布高度', () => {
      const mockCanvas = createMockCanvas();
      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.resetWidthHeight({ height: 600 });
      });

      expect(mockCanvas.setWidth).not.toHaveBeenCalled();
      expect(mockCanvas.setHeight).toHaveBeenCalledWith(600);
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('应该正确同时重置画布宽度和高度', () => {
      const mockCanvas = createMockCanvas();
      const { result } = renderHook(() =>
        useCommonOperation({ canvas: mockCanvas }),
      );

      act(() => {
        result.current.resetWidthHeight({ width: 800, height: 600 });
      });

      expect(mockCanvas.setWidth).toHaveBeenCalledWith(800);
      expect(mockCanvas.setHeight).toHaveBeenCalledWith(600);
      expect(mockCanvas.fire).toHaveBeenCalledWith('object:modified');
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });
  });
});
