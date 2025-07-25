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
 
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { type Canvas, type FabricObject } from 'fabric';
import { renderHook, act } from '@testing-library/react';
import { ViewVariableType } from '@coze-workflow/base/types';

import { createElement } from '../../src/utils';
import type { FabricSchema } from '../../src/typings';
import { useCanvasChange, saveProps } from '../../src/hooks/use-canvas-change';

enum Mode {
  INLINE_TEXT = 'inline_text',
  BLOCK_TEXT = 'block_text',
  RECT = 'rect',
  TRIANGLE = 'triangle',
  CIRCLE = 'ellipse',
  STRAIGHT_LINE = 'straight_line',
  PENCIL = 'pencil',
  IMAGE = 'img',
  GROUP = 'group',
}

// Mock createElement
vi.mock('../../src/utils', () => ({
  createElement: vi.fn(),
  defaultProps: {
    [Mode.IMAGE]: {
      width: 100,
      height: 100,
    },
    [Mode.BLOCK_TEXT]: {
      width: 200,
      height: 50,
    },
  },
}));

// Mock getUploadCDNAsset
vi.mock('@coze-workflow/base-adapter', () => ({
  getUploadCDNAsset: vi.fn(path => `https://cdn.example.com${path}`),
}));

describe('useCanvasChange', () => {
  const createMockCanvas = () => {
    const mockCanvas = {
      on: vi.fn((event: string, callback: (event: any) => void) =>
        // 返回一个清理函数
        () => {
          mockCanvas.off(event, callback);
        },
      ),
      off: vi.fn(),
      add: vi.fn(),
      setActiveObject: vi.fn(),
      toObject: vi.fn(),
    };
    return mockCanvas as unknown as Canvas;
  };

  const createMockObject = (props = {}) => {
    const mockObject = {
      customId: 'test-id',
      customType: 'test-type',
      ...props,
    };
    return mockObject as unknown as FabricObject;
  };

  const createMockSchema = (overrides = {}): FabricSchema => ({
    width: 800,
    height: 600,
    background: '#ffffff',
    customType: Mode.IMAGE,
    customId: 'canvas-1',
    objects: [],
    customVariableRefs: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在没有 canvas 时不设置事件监听', () => {
    const mockOnChange = vi.fn();
    renderHook(() =>
      useCanvasChange({
        canvas: undefined,
        onChange: mockOnChange,
      }),
    );

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('应该正确监听画布变化事件', () => {
    const mockCanvas = createMockCanvas();
    const mockOnChange = vi.fn();
    const mockSchema = createMockSchema();
    (mockCanvas.toObject as Mock).mockReturnValue(mockSchema);

    renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        onChange: mockOnChange,
      }),
    );

    // 验证是否监听了所有默认事件
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:modified',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:added',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:removed',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:moving',
      expect.any(Function),
    );
    expect(mockCanvas.on).toHaveBeenCalledWith(
      'object:modified-zIndex',
      expect.any(Function),
    );
  });

  it('应该在事件触发时调用 onChange', () => {
    const mockCanvas = createMockCanvas();
    const mockOnChange = vi.fn();
    const mockSchema = createMockSchema();
    (mockCanvas.toObject as Mock).mockReturnValue(mockSchema);

    renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        onChange: mockOnChange,
      }),
    );

    // 获取 object:modified 事件的回调函数
    const modifiedCallback = (mockCanvas.on as any).mock.calls.find(
      (call: [string, Function]) => call[0] === 'object:modified',
    )?.[1];

    // 模拟事件触发
    modifiedCallback?.();

    expect(mockCanvas.toObject).toHaveBeenCalledWith(saveProps);
    expect(mockOnChange).toHaveBeenCalledWith(mockSchema);
  });

  it('应该在删除对象时重置引用关系', () => {
    const mockCanvas = createMockCanvas();
    const mockOnChange = vi.fn();
    const mockVariables = [
      { id: 'var1', name: 'var1', type: ViewVariableType.String, index: 0 },
      { id: 'var2', name: 'var2', type: ViewVariableType.String, index: 1 },
    ];
    const mockSchema = createMockSchema({
      objects: [{ customId: 'obj1' }],
      customVariableRefs: [
        { objectId: 'obj1', variableId: 'var1', variableName: 'var1' },
        { objectId: 'obj2', variableId: 'var2', variableName: 'var2' },
      ],
    });
    (mockCanvas.toObject as Mock).mockReturnValue(mockSchema);

    renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        onChange: mockOnChange,
        schema: mockSchema,
        variables: mockVariables,
      }),
    );

    // 获取 object:removed 事件的回调函数
    const removedCallback = (mockCanvas.on as any).mock.calls.find(
      (call: [string, Function]) => call[0] === 'object:removed',
    )?.[1];

    // 模拟删除事件
    removedCallback?.();

    // 验证只保留了存在对象的引用
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockSchema,
      customVariableRefs: [
        { objectId: 'obj1', variableId: 'var1', variableName: 'var1' },
      ],
    });
  });

  it('应该正确添加图片类型的变量引用', async () => {
    const mockCanvas = createMockCanvas();
    const mockElement = createMockObject({ customId: 'img1' });
    vi.mocked(createElement).mockResolvedValue(mockElement);

    const { result } = renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        schema: createMockSchema(),
      }),
    );

    await act(async () => {
      await result.current.addRefObjectByVariable({
        id: 'var1',
        name: 'image1',
        type: ViewVariableType.Image,
        index: 0,
      });
    });

    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: Mode.IMAGE,
        elementProps: expect.objectContaining({
          editable: false,
          src: expect.stringContaining('img-placeholder.png'),
        }),
      }),
    );
    expect(mockCanvas.add).toHaveBeenCalledWith(mockElement);
    expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(mockElement);
  });

  it('应该正确添加文本类型的变量引用', async () => {
    const mockCanvas = createMockCanvas();
    const mockElement = createMockObject({ customId: 'text1' });
    vi.mocked(createElement).mockResolvedValue(mockElement);

    const { result } = renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        schema: createMockSchema(),
      }),
    );

    await act(async () => {
      await result.current.addRefObjectByVariable({
        id: 'var1',
        name: 'text1',
        type: ViewVariableType.String,
        index: 0,
      });
    });

    expect(mockCanvas.add).toHaveBeenCalledWith(mockElement);
    expect(mockCanvas.setActiveObject).toHaveBeenCalledWith(mockElement);
  });

  it('应该正确更新对象的引用关系', () => {
    const mockCanvas = createMockCanvas();
    const mockVariables = [
      { id: 'var1', name: 'var1', type: ViewVariableType.String, index: 0 },
      { id: 'var2', name: 'var2', type: ViewVariableType.String, index: 1 },
      { id: 'var3', name: 'var3', type: ViewVariableType.String, index: 2 },
    ];
    const initialRefs = [
      { objectId: 'obj1', variableId: 'var1', variableName: 'var1' },
    ];
    const mockSchema = createMockSchema({ customVariableRefs: initialRefs });
    (mockCanvas.toObject as Mock).mockReturnValue({
      ...mockSchema,
      customVariableRefs: [
        { objectId: 'obj2', variableId: 'var3', variableName: 'var3' },
      ],
    });

    const { result } = renderHook(() =>
      useCanvasChange({
        canvas: mockCanvas,
        schema: createMockSchema({ customVariableRefs: initialRefs }),
        variables: mockVariables,
      }),
    );

    // 更新已存在的引用
    act(() => {
      result.current.updateRefByObjectId({
        objectId: 'obj1',
        variable: {
          id: 'var2',
          name: 'var2',
          type: ViewVariableType.String,
          index: 0,
        },
      });
    });

    // 添加新的引用
    act(() => {
      result.current.updateRefByObjectId({
        objectId: 'obj2',
        variable: {
          id: 'var3',
          name: 'var3',
          type: ViewVariableType.String,
          index: 0,
        },
      });
    });

    // 删除引用
    act(() => {
      result.current.updateRefByObjectId({
        objectId: 'obj1',
      });
    });

    // 验证最终的引用关系
    expect(mockCanvas.toObject().customVariableRefs).toEqual([
      { objectId: 'obj2', variableId: 'var3', variableName: 'var3' },
    ]);
  });
});
