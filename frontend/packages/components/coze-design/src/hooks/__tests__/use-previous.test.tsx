import React, { useState } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { usePrevious } from '../use-previous';

// 创建一个测试组件来使用 usePrevious hook
const TestComponent = ({ initialValue }: { initialValue: number }) => {
  const [value, setValue] = useState(initialValue);
  const previousValue = usePrevious(value);

  return (
    <div>
      <div data-testid="current-value">{value}</div>
      <div data-testid="previous-value">{previousValue}</div>
      <button
        data-testid="increment-button"
        onClick={() => setValue(value + 1)}
      >
        Increment
      </button>
    </div>
  );
};

describe('usePrevious', () => {
  it('初始渲染时应该返回 undefined', () => {
    render(<TestComponent initialValue={0} />);

    // 初始渲染时，previousValue 应该是 undefined
    expect(screen.getByTestId('current-value').textContent).toBe('0');
    expect(screen.getByTestId('previous-value').textContent).toBe('');
  });

  it('应该在值更新后返回上一个值', () => {
    render(<TestComponent initialValue={0} />);

    // 初始状态
    expect(screen.getByTestId('current-value').textContent).toBe('0');
    expect(screen.getByTestId('previous-value').textContent).toBe('');

    // 点击按钮增加值
    fireEvent.click(screen.getByTestId('increment-button'));

    // 更新后，current 应该是 1，previous 应该是 0
    expect(screen.getByTestId('current-value').textContent).toBe('1');
    expect(screen.getByTestId('previous-value').textContent).toBe('0');

    // 再次点击按钮
    fireEvent.click(screen.getByTestId('increment-button'));

    // 再次更新后，current 应该是 2，previous 应该是 1
    expect(screen.getByTestId('current-value').textContent).toBe('2');
    expect(screen.getByTestId('previous-value').textContent).toBe('1');
  });

  it('应该在多次更新后正确跟踪上一个值', () => {
    render(<TestComponent initialValue={10} />);

    // 初始状态
    expect(screen.getByTestId('current-value').textContent).toBe('10');
    expect(screen.getByTestId('previous-value').textContent).toBe('');

    // 连续点击按钮三次
    fireEvent.click(screen.getByTestId('increment-button'));
    fireEvent.click(screen.getByTestId('increment-button'));
    fireEvent.click(screen.getByTestId('increment-button'));

    // 最终 current 应该是 13，previous 应该是 12
    expect(screen.getByTestId('current-value').textContent).toBe('13');
    expect(screen.getByTestId('previous-value').textContent).toBe('12');
  });
});
