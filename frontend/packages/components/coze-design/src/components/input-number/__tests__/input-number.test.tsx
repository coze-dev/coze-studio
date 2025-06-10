import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { useDragNumberControl } from '@/hooks/use-drag-number-control';

// Mock the useDragNumberControl hook
vi.mock('@/hooks/use-drag-number-control', () => ({
  useDragNumberControl: vi.fn().mockReturnValue({
    isDragging: false,
    handleDragStart: vi.fn(),
  }),
}));

import { CozInputNumber } from '../input-number-new';
import { InputNumber } from '../input-number';

describe('InputNumber', () => {
  it('render correctly', () => {
    render(<InputNumber defaultValue={2024} />);
    expect(document.getElementsByClassName('coz-input-number')).toHaveLength(1);
    expect(document.getElementsByTagName('input')[0].value).toBe('2024');
  });

  it('test value controlled', () => {
    render(<InputNumber value={10} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];
    expect(input.value).toBe('10');
    fireEvent.mouseDown(plus);
    expect(input.value).toBe('10');
  });

  it('test disabled', () => {
    render(<InputNumber disabled={true} />);
    // @ts-expect-error -- linter-disable-autofix
    expect(document.querySelector('input').disabled).toBe(true);
    expect(document.getElementsByTagName('button')[0].disabled).toBe(true);
    expect(document.getElementsByTagName('button')[1].disabled).toBe(true);
  });

  it('test error', () => {
    render(<InputNumber error={true} />);
    expect(
      document.getElementsByClassName('coz-input-number')[0].className,
    ).toContain('coz-input-number-error');
  });

  it('test plus onUpClick', () => {
    const fn = vi.fn();
    render(<InputNumber onUpClick={fn} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];

    fireEvent.mouseDown(plus);
    expect(input.value).toBe('1');
    expect(fn).toBeCalled();
  });

  it('test minus onDownClick', () => {
    const fn = vi.fn();
    render(<InputNumber onDownClick={fn} />);
    const input = document.getElementsByTagName('input')[0];
    const minus = document.getElementsByTagName('button')[0];

    fireEvent.mouseDown(minus);
    expect(input.value).toBe('-1');
    expect(fn).toBeCalled();
  });

  it('test max', () => {
    render(<InputNumber defaultValue={10} max={10} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];
    expect(plus.disabled).toBe(true);
    fireEvent.mouseDown(plus);
    expect(input.value).toBe('10');
  });

  it('test step', () => {
    render(<InputNumber defaultValue={5} step={10} min={1} max={20} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];
    const minus = document.getElementsByTagName('button')[0];

    fireEvent.mouseDown(plus);

    expect(input.value).toBe('15');
    // value + step > max
    fireEvent.mouseDown(plus);
    expect(input.value).toBe('15');
    fireEvent.mouseDown(minus);
    expect(input.value).toBe('5');

    // value - step < min
    fireEvent.mouseDown(minus);
    expect(input.value).toBe('5');
  });

  it('test shiftStep', () => {
    render(<InputNumber defaultValue={1} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];
    const minus = document.getElementsByTagName('button')[0];

    // mock shift down
    fireEvent.mouseDown(plus, { shiftKey: true });
    expect(input.value).toBe('11');

    fireEvent.mouseDown(minus, { shiftKey: true });
    expect(input.value).toBe('1');
  });

  it('test onChange onNumberChange', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    render(<InputNumber onChange={fn1} onNumberChange={fn2} />);
    // 按钮触发
    const plus = document.getElementsByTagName('button')[1];

    fireEvent.mouseDown(plus);
    expect(fn1).toBeCalledWith(1);
    expect(fn2).toBeCalledWith(1);
    // 输入框触发
    const input = document.getElementsByTagName('input')[0];
    fireEvent.change(input, { target: { value: '10' } });
    expect(fn1).toBeCalledWith(10);
    expect(fn2).toBeCalledWith(10);
  });

  it('test hideButtons', () => {
    render(<InputNumber hideButtons={true} />);
    expect(
      document.getElementsByClassName('coz-input-number-button'),
    ).toHaveLength(0);
  });

  it('test innerButtons', () => {
    render(<InputNumber innerButtons={true} />);
    expect(
      document.getElementsByClassName('coz-input-number-button'),
    ).toHaveLength(0);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.focus(input);
    expect(
      document.getElementsByClassName('semi-input-number-suffix-btns'),
    ).toHaveLength(1);
  });

  it('test suffix', () => {
    render(<InputNumber suffix="suffix" />);
    const suffix = document.getElementsByClassName('coz-input-number-suffix');
    expect(suffix).toHaveLength(1);
    expect(suffix[0].textContent).toBe('suffix');
  });

  it('test focus', () => {
    render(<InputNumber />);
    const inputNumber = document.getElementsByClassName('coz-input-number')[0];
    const plus = document.getElementsByTagName('button')[1];
    fireEvent.mouseDown(plus);
    expect(inputNumber.className).toContain('coz-input-number-focus');
    fireEvent.mouseLeave(plus);
    expect(inputNumber.className).not.toContain('coz-input-number-focus');
  });

  it('test long press plus', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<InputNumber pressInterval={50} value={1} onNumberChange={fn} />);
    const plus = document.getElementsByTagName('button')[1];
    fireEvent.mouseDown(plus);
    vi.advanceTimersByTime(1000);
    fireEvent.mouseUp(plus);
    // 调用多次
    expect(fn.mock.calls.length).toBeGreaterThan(1);
    vi.useRealTimers();
    vi.clearAllTimers();
  });
  it('test long press minus', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<InputNumber pressInterval={50} value={1} onNumberChange={fn} />);
    const minus = document.getElementsByTagName('button')[0];
    fireEvent.mouseDown(minus);
    vi.advanceTimersByTime(1000);
    fireEvent.mouseUp(minus);
    // 调用多次
    expect(fn.mock.calls.length).toBeGreaterThan(1);
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('text onBlur', () => {
    const fn = vi.fn();
    render(<InputNumber onBlur={fn} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(fn).toBeCalled();
  });

  it('fix: onNumberChange not called', () => {
    const fn = vi.fn();
    render(<InputNumber onNumberChange={fn} min={10} max={100} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 10000 } });
    fireEvent.blur(input);
    expect(fn).toBeCalledWith(100);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: -10000 } });
    fireEvent.blur(input);
    expect(fn).toBeCalledWith(10);
  });

  it('fix: 0.1 + 0.2 !== 0.3', () => {
    render(<InputNumber defaultValue={0.2} step={0.1} />);
    const input = document.getElementsByTagName('input')[0];
    const plus = document.getElementsByTagName('button')[1];
    fireEvent.mouseDown(plus);
    expect(input.value).toBe('0.3');
  });
});

describe('input-number-new', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: vi.fn(),
    });
  });

  it('render correctly', () => {
    render(<CozInputNumber defaultValue={2024} />);
    expect(
      document.getElementsByClassName('coz-input-number-new'),
    ).toHaveLength(1);
    expect(document.getElementsByTagName('input')[0].value).toBe('2024');
  });

  it('should hide buttons when hideButtons is true', () => {
    render(<CozInputNumber hideButtons={true} />);
    const element = document.getElementsByClassName('coz-input-number-new')[0];
    expect(element.className).toContain('coz-input-number-new-hide-buttons');
    expect(element.querySelector('.semi-input-number-suffix-btns')).toBeNull();
  });

  it('test onChange onNumberChange', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    render(<CozInputNumber onChange={fn1} onNumberChange={fn2} />);

    const inputWrapper =
      document.getElementsByClassName('semi-input-wrapper')[0];

    expect(inputWrapper).not.toBeNull();

    // 鼠标hover，才会显示按钮
    fireEvent.mouseEnter(inputWrapper!);
    fireEvent.mouseOver(inputWrapper!);

    // 按钮触发
    const plus = document.getElementsByClassName(
      'semi-input-number-button-up',
    )[0];

    fireEvent.mouseDown(plus);
    expect(fn1).toBeCalled();
    expect(fn2).toBeCalled();
    // 输入框触发
    const input = document.getElementsByTagName('input')[0];
    fireEvent.change(input, { target: { value: '10' } });
    expect(fn1).toBeCalled();
    expect(fn2).toBeCalled();
  });

  it('should apply drag control when sliderControl is true with prefix', () => {
    // Setup mock for this test
    const mockHandleDragStart = vi.fn();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={true} prefix="$" />,
    );

    // 检查是否有包含ew-resize-cursor类的元素
    const resizeCursorElement = container.querySelector('.ew-resize-cursor');
    expect(resizeCursorElement).not.toBeNull();
    // 检查该元素是否包含prefix内容
    expect(resizeCursorElement?.textContent).toBe('$');
  });

  it('should apply drag control when sliderControl is true with suffix', () => {
    // Setup mock for this test
    const mockHandleDragStart = vi.fn();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={true} suffix="%" />,
    );

    // 检查是否有包含ew-resize-cursor类的元素
    const resizeCursorElement = container.querySelector('.ew-resize-cursor');
    expect(resizeCursorElement).not.toBeNull();
    // 检查该元素是否包含suffix内容
    expect(resizeCursorElement?.textContent).toBe('%');
  });

  it('should not apply drag control when sliderControl is false', () => {
    // Setup mock for this test
    const mockHandleDragStart = vi.fn();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={false} prefix="$" suffix="%" />,
    );

    // 检查是否没有包含ew-resize-cursor类的元素
    const resizeCursorElement = container.querySelector('.ew-resize-cursor');
    expect(resizeCursorElement).toBeNull();
  });

  it('should trigger handleDragStart when mouse down on prefix with sliderControl', () => {
    // Create a mock for the handleDragStart function
    const mockHandleDragStart = vi.fn();

    // Setup mock for this test
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={true} prefix="$" />,
    );

    // 找到包含ew-resize-cursor类的元素
    const resizeCursorElement = container.querySelector('.ew-resize-cursor');
    expect(resizeCursorElement).not.toBeNull();

    // 触发mouseDown事件
    fireEvent.mouseDown(resizeCursorElement!);

    // 检查handleDragStart是否被调用
    expect(mockHandleDragStart).toHaveBeenCalled();
  });

  it('should trigger handleDragStart when mouse down on suffix with sliderControl', () => {
    // Create a mock for the handleDragStart function
    const mockHandleDragStart = vi.fn();

    // Setup mock for this test
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={true} suffix="%" />,
    );

    // 找到包含ew-resize-cursor类的元素
    const resizeCursorElement = container.querySelector('.ew-resize-cursor');
    expect(resizeCursorElement).not.toBeNull();

    // 触发mouseDown事件
    fireEvent.mouseDown(resizeCursorElement!);

    // 检查handleDragStart是否被调用
    expect(mockHandleDragStart).toHaveBeenCalled();
  });

  it('should add dragging class when isDragging is true', () => {
    // Setup mock for this test
    const mockHandleDragStart = vi.fn();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: true,
      handleDragStart: mockHandleDragStart,
    });

    const { container } = render(
      <CozInputNumber sliderControl={true} prefix="$" />,
    );

    const inputNumberElement = container.querySelector('.coz-input-number-new');
    expect(inputNumberElement).not.toBeNull();
    expect(inputNumberElement?.className).toContain(
      'coz-input-number-new-dragging',
    );
  });

  // Verify that useDragNumberControl is called with correct parameters
  it('should call useDragNumberControl with correct parameters', () => {
    // Setup mock for this test
    const mockHandleDragStart = vi.fn();
    (useDragNumberControl as jest.Mock).mockReturnValue({
      isDragging: false,
      handleDragStart: mockHandleDragStart,
    });

    const value = 42;
    const step = 5;
    const min = 0;
    const max = 100;

    render(
      <CozInputNumber
        sliderControl={true}
        value={value}
        step={step}
        min={min}
        max={max}
        prefix="$"
      />,
    );

    // Check if useDragNumberControl was called with correct parameters
    expect(useDragNumberControl).toHaveBeenCalledWith(
      expect.objectContaining({
        value,
        step,
        min,
        max,
        onChange: expect.any(Function),
      }),
    );
  });
});
