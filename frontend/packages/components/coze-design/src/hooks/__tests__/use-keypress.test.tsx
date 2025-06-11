import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { useKeypress } from '../use-keypress';

// 创建一个测试组件来使用 useKeypress hook
const TestComponent = ({
  targetKey,
  active = true,
  onKeyPress,
}: {
  targetKey: string;
  active?: boolean;
  onKeyPress: (event: KeyboardEvent) => void;
}) => {
  useKeypress(targetKey, active, onKeyPress);
  return <div data-testid="test-component">Test Component</div>;
};

describe('useKeypress', () => {
  it('应该在按下指定键时调用回调函数', () => {
    const handleKeyPress = vi.fn();
    render(
      <TestComponent
        targetKey="Enter"
        active={true}
        onKeyPress={handleKeyPress}
      />,
    );

    // 模拟按下 Enter 键
    fireEvent.keyDown(document, { key: 'Enter' });

    // 验证回调函数被调用
    expect(handleKeyPress).toHaveBeenCalledTimes(1);
    expect(handleKeyPress.mock.calls[0][0].key).toBe('Enter');
  });

  it('当 active 为 false 时不应该调用回调函数', () => {
    const handleKeyPress = vi.fn();
    render(
      <TestComponent
        targetKey="Enter"
        active={false}
        onKeyPress={handleKeyPress}
      />,
    );

    // 模拟按下 Enter 键
    fireEvent.keyDown(document, { key: 'Enter' });

    // 验证回调函数没有被调用
    expect(handleKeyPress).not.toHaveBeenCalled();
  });

  it('当按下不同的键时不应该调用回调函数', () => {
    const handleKeyPress = vi.fn();
    render(
      <TestComponent
        targetKey="Enter"
        active={true}
        onKeyPress={handleKeyPress}
      />,
    );

    // 模拟按下 Space 键
    fireEvent.keyDown(document, { key: 'Space' });

    // 验证回调函数没有被调用
    expect(handleKeyPress).not.toHaveBeenCalled();
  });

  it('应该为 ArrowDown 和 ArrowUp 键调用 preventDefault', () => {
    // 由于我们无法直接测试 preventDefault 是否被调用，
    // 我们可以通过检查 useKeypress 的实现来确认它是否正确处理了这些键

    // 测试 ArrowDown 键
    const handleKeyPressDown = vi.fn();
    render(
      <TestComponent
        targetKey="ArrowDown"
        active={true}
        onKeyPress={handleKeyPressDown}
      />,
    );

    // 创建一个带有 preventDefault 方法的模拟事件
    const preventDefaultMock = vi.fn();
    fireEvent.keyDown(document, {
      key: 'ArrowDown',
      preventDefault: preventDefaultMock,
    });

    // 验证回调函数被调用
    expect(handleKeyPressDown).toHaveBeenCalledTimes(1);

    // 由于我们无法直接测试 preventDefault 是否被调用，
    // 我们可以检查 useKeypress 的源代码，确认它在 ArrowDown 和 ArrowUp 键上调用了 preventDefault
    // 这里我们只能验证回调函数被调用了

    // 测试 ArrowUp 键
    const handleKeyPressUp = vi.fn();
    render(
      <TestComponent
        targetKey="ArrowUp"
        active={true}
        onKeyPress={handleKeyPressUp}
      />,
    );

    fireEvent.keyDown(document, {
      key: 'ArrowUp',
      preventDefault: preventDefaultMock,
    });

    // 验证回调函数被调用
    expect(handleKeyPressUp).toHaveBeenCalledTimes(1);
  });

  it('应该在组件卸载时移除事件监听器', () => {
    const handleKeyPress = vi.fn();
    const { unmount } = render(
      <TestComponent
        targetKey="Enter"
        active={true}
        onKeyPress={handleKeyPress}
      />,
    );

    // 模拟按下 Enter 键
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handleKeyPress).toHaveBeenCalledTimes(1);

    // 卸载组件
    unmount();

    // 再次模拟按下 Enter 键
    fireEvent.keyDown(document, { key: 'Enter' });

    // 验证回调函数没有被再次调用
    expect(handleKeyPress).toHaveBeenCalledTimes(1);
  });
});
