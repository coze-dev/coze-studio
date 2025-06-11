import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDragNumberControl } from '../use-drag-number-control';

// 模拟DOM API
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
};

// 模拟window.setInterval和window.clearInterval
const mockSetInterval = vi.fn().mockReturnValue(123); // 返回一个定时器ID
const mockClearInterval = vi.fn();

// 模拟window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('useDragNumberControl', () => {
  // 在每个测试前设置模拟
  beforeEach(() => {
    // 保存原始方法
    vi.spyOn(document, 'addEventListener').mockImplementation(
      mockAddEventListener,
    );
    vi.spyOn(document, 'removeEventListener').mockImplementation(
      mockRemoveEventListener,
    );
    vi.spyOn(document.documentElement.classList, 'add').mockImplementation(
      mockClassList.add,
    );
    vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(
      mockClassList.remove,
    );
    vi.spyOn(window, 'setInterval').mockImplementation(mockSetInterval as any);
    vi.spyOn(window, 'clearInterval').mockImplementation(mockClearInterval);

    // 重置所有模拟的调用记录
    vi.clearAllMocks();
  });

  // 在每个测试后清理模拟
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 测试初始状态
  it('should initialize with correct state', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange,
        step: 1,
        min: 0,
        max: 100,
      }),
    );

    // 初始状态应该是非拖拽状态
    expect(result.current.isDragging).toBe(false);
    // 应该提供handleDragStart方法
    expect(typeof result.current.handleDragStart).toBe('function');
  });

  // 测试开始拖拽
  it('should handle drag start correctly', () => {
    const onChange = vi.fn();
    const mockInputRef = {
      current: {
        blur: vi.fn(),
      },
    } as unknown as RefObject<HTMLInputElement>;

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange,
        step: 1,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 调用handleDragStart
    act(() => {
      result.current.handleDragStart(mockEvent, mockInputRef);
    });

    // 应该设置为拖拽状态
    expect(result.current.isDragging).toBe(true);

    // 应该添加cursor类
    expect(mockClassList.add).toHaveBeenCalledWith('ew-resize-cursor');

    // 应该调用input的blur方法
    expect(mockInputRef.current?.blur).toHaveBeenCalled();

    // 应该添加事件监听器
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );
  });

  // 测试拖拽结束
  it('should handle drag end correctly', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange,
        step: 1,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mouseup处理函数
    const mouseUpHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mouseup',
    )?.[1];

    if (mouseUpHandler) {
      // 模拟mouseup事件
      act(() => {
        mouseUpHandler();
      });

      // 应该重置拖拽状态
      expect(result.current.isDragging).toBe(false);

      // 应该移除cursor类
      expect(mockClassList.remove).toHaveBeenCalledWith('ew-resize-cursor');

      // 应该移除事件监听器
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function),
      );
    }
  });

  // 测试数值格式化和限制
  it('should format and limit values correctly', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange,
        step: 0.5,
        min: 5,
        max: 15,
      }),
    );

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    // 模拟mousemove事件 - 超出最大值
    const mockMoveEvent1 = {
      clientX: 120, // 向右移动20px，应该增加20*step
    };

    // 模拟mousemove事件 - 低于最小值
    const mockMoveEvent2 = {
      clientX: 80, // 向左移动20px，应该减少20*step
    };

    // 调用mousemove处理函数
    if (mouseMoveHandler) {
      mouseMoveHandler(mockMoveEvent1);
      // 应该限制在最大值15
      expect(onChange).toHaveBeenCalledWith(15);

      onChange.mockClear();

      mouseMoveHandler(mockMoveEvent2);
      // 应该限制在最小值5
      expect(onChange).toHaveBeenCalledWith(5);
    }
  });

  // 测试清理
  it('should clean up event listeners on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange: vi.fn(),
        step: 1,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 卸载组件
    unmount();

    // 验证是否移除了事件监听器
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );
  });

  // 测试左边缘自动变化逻辑
  it('should auto-decrease value when mouse is near left edge', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 50,
        onChange,
        step: 1,
        min: 0,
        max: 100,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动到左边缘（小于50px）
      const leftEdgeEvent = { clientX: 30 };
      mouseMoveHandler(leftEdgeEvent);

      // 应该设置自动减少的定时器
      expect(mockSetInterval).toHaveBeenCalled();
      expect(mockSetInterval.mock.calls[0][1]).toBe(50); // 检查定时器间隔

      // 获取并调用setInterval的回调函数来模拟定时器触发
      const intervalCallback = mockSetInterval.mock.calls[0][0];
      intervalCallback();

      // 应该调用onChange减少值
      expect(onChange).toHaveBeenCalled();
    }
  });

  // 测试右边缘自动变化逻辑
  it('should auto-increase value when mouse is near right edge', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 50,
        onChange,
        step: 1,
        min: 0,
        max: 100,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动到右边缘（大于window.innerWidth - 50px）
      const rightEdgeEvent = { clientX: 1000 };
      mouseMoveHandler(rightEdgeEvent);

      // 应该设置自动增加的定时器
      expect(mockSetInterval).toHaveBeenCalled();
      expect(mockSetInterval.mock.calls[0][1]).toBe(50); // 检查定时器间隔

      // 获取并调用setInterval的回调函数来模拟定时器触发
      const intervalCallback = mockSetInterval.mock.calls[0][0];
      intervalCallback();

      // 应该调用onChange增加值
      expect(onChange).toHaveBeenCalled();
    }
  });

  // 测试正常拖拽移动逻辑
  it('should update value based on mouse movement delta', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 50,
        onChange,
        step: 0.5,
        min: 0,
        max: 100,
      }),
    );

    // 模拟鼠标事件，起始位置为100
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标向右移动20px
      const moveRightEvent = { clientX: 120 };
      mouseMoveHandler(moveRightEvent);

      // 应该调用onChange，增加值 (20 * 0.5 = 10)
      expect(onChange).toHaveBeenCalledWith(60);

      onChange.mockClear();

      // 模拟鼠标向左移动40px（相对于起始位置）
      const moveLeftEvent = { clientX: 60 };
      mouseMoveHandler(moveLeftEvent);

      // 应该调用onChange，减少值 (40 * 0.5 = 20)
      expect(onChange).toHaveBeenCalledWith(30);
    }
  });

  // 测试非拖拽状态下的鼠标移动
  it('should not update value when not dragging', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useDragNumberControl({
        value: 50,
        onChange,
        step: 1,
      }),
    );

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动事件
      const moveEvent = { clientX: 120 };
      mouseMoveHandler(moveEvent);

      // 不应该调用onChange
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  // 测试定时器清理逻辑
  it('should clear interval timer when component unmounts', () => {
    const onChange = vi.fn();

    const { result, unmount } = renderHook(() =>
      useDragNumberControl({
        value: 50,
        onChange,
        step: 1,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动到左边缘触发定时器
      const leftEdgeEvent = { clientX: 30 };
      mouseMoveHandler(leftEdgeEvent);
    }

    // 卸载组件
    unmount();

    // 应该清除定时器
    expect(mockClearInterval).toHaveBeenCalled();
  });

  // 测试小数步长的格式化
  it('should correctly format values with decimal steps', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: 10,
        onChange,
        step: 0.25,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动
      const moveEvent = { clientX: 104 };
      mouseMoveHandler(moveEvent);

      // 应该调用onChange，增加值 (4 * 0.25 = 1)，保留2位小数
      expect(onChange).toHaveBeenCalledWith(11);
    }
  });

  // 测试undefined值的处理
  it('should handle undefined values correctly', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useDragNumberControl({
        value: undefined,
        onChange,
        step: 1,
      }),
    );

    // 模拟鼠标事件
    const mockEvent = {
      clientX: 100,
    } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;

    // 开始拖拽
    act(() => {
      result.current.handleDragStart(mockEvent);
    });

    // 获取mousemove处理函数
    const mouseMoveHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'mousemove',
    )?.[1];

    if (mouseMoveHandler) {
      // 模拟鼠标移动
      const moveEvent = { clientX: 110 };
      mouseMoveHandler(moveEvent);

      // 应该从0开始计算
      expect(onChange).toHaveBeenCalledWith(10);
    }
  });
});
