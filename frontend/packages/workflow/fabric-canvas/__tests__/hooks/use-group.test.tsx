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
import {
  type Canvas,
  type ActiveSelection,
  type Group,
  type FabricObject,
} from 'fabric';
import { renderHook, act } from '@testing-library/react';

import { createElement } from '../../src/utils';
import { Mode } from '../../src/typings';
import { useGroup } from '../../src/hooks/use-group';

// Mock createElement and isGroupElement
const mockIsGroupElement = vi.fn();
vi.mock('../../src/utils', () => ({
  createElement: vi.fn(),
  isGroupElement: (obj: unknown) => mockIsGroupElement(obj),
}));

describe('useGroup', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      getActiveObject: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockGroup = () => {
    const group = {
      type: 'group',
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      add: vi.fn(),
      remove: vi.fn(),
      getObjects: vi.fn(),
      // Add the necessary fabric. Object properties
      noScaleCache: false,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      originX: 'left' as const,
      originY: 'top' as const,
      fill: '',
      stroke: '',
      strokeWidth: 1,
      opacity: 1,
      visible: true,
      hasControls: true,
      hasBorders: true,
      selectable: true,
      evented: true,
      canvas: null,
    };
    return group as unknown as Group;
  };

  const createMockActiveSelection = () => {
    const selection = {
      getObjects: vi.fn(),
      left: 100,
      top: 100,
      width: 200,
      height: 200,
    };
    return selection as unknown as ActiveSelection;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createElement).mockReset();
    mockIsGroupElement.mockReset();
  });

  describe('group', () => {
    it('应该在没有 canvas 时不执行任何操作', async () => {
      const { result } = renderHook(() => useGroup({ canvas: undefined }));
      await act(() => result.current.group());
      expect(createElement).not.toHaveBeenCalled();
    });

    it('应该在选中少于两个元素时不执行分组', async () => {
      const mockCanvas = createMockCanvas();
      const mockActiveSelection = createMockActiveSelection();
      const mockGetObjects = vi.fn().mockReturnValue([{ id: '1' }]);
      Object.assign(mockActiveSelection, { getObjects: mockGetObjects });
      (
        mockCanvas.getActiveObject as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockActiveSelection);

      const { result } = renderHook(() => useGroup({ canvas: mockCanvas }));
      await act(() => result.current.group());

      expect(createElement).not.toHaveBeenCalled();
      expect(mockCanvas.add).not.toHaveBeenCalled();
    });

    it('应该正确执行分组操作', async () => {
      const mockCanvas = createMockCanvas();
      const mockActiveSelection = createMockActiveSelection();
      const mockObjects = [
        { id: '1', type: 'rect' },
        { id: '2', type: 'circle' },
      ] as unknown as FabricObject[];
      const mockGroupElement = createMockGroup();

      const mockGetObjects = vi.fn().mockReturnValue(mockObjects);
      Object.assign(mockActiveSelection, { getObjects: mockGetObjects });
      (
        mockCanvas.getActiveObject as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockActiveSelection);
      vi.mocked(createElement).mockResolvedValue(mockGroupElement);

      const { result } = renderHook(() => useGroup({ canvas: mockCanvas }));
      await act(() => result.current.group());

      expect(createElement).toHaveBeenCalledWith({
        mode: Mode.GROUP,
        elementProps: {
          left: mockActiveSelection.left,
          top: mockActiveSelection.top,
          width: mockActiveSelection.width,
          height: mockActiveSelection.height,
        },
      });

      expect(mockGroupElement.add).toHaveBeenCalledWith(...mockObjects);
      expect(mockCanvas.add).toHaveBeenCalledWith(mockGroupElement);
      expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(mockGroupElement);
      expect(mockCanvas.remove).toHaveBeenCalledWith(...mockObjects);
    });
  });

  describe('unGroup', () => {
    it('应该在没有 canvas 时不执行任何操作', async () => {
      const { result } = renderHook(() => useGroup({ canvas: undefined }));
      await act(() => result.current.unGroup());
      expect(createElement).not.toHaveBeenCalled();
    });

    it('应该在选中的不是组元素时不执行解组', async () => {
      const mockCanvas = createMockCanvas();
      (
        mockCanvas.getActiveObject as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue({ type: 'rect' });

      const { result } = renderHook(() => useGroup({ canvas: mockCanvas }));
      await act(() => result.current.unGroup());

      expect(createElement).not.toHaveBeenCalled();
      expect(mockCanvas.add).not.toHaveBeenCalled();
    });
  });
});
