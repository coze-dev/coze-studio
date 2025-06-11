import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useControllableValue } from '../use-controllable-value';

interface TestProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, ...args: any[]) => void;
}

describe('useControllableValue', () => {
  // 测试非受控模式
  it('should work in uncontrolled mode', () => {
    // 使用默认值初始化
    const { result } = renderHook(() =>
      useControllableValue({ defaultValue: 'default value' }),
    );

    // 检查初始值是否正确
    expect(result.current[0]).toBe('default value');

    // 更新值
    act(() => {
      result.current[1]('new value');
    });

    // 检查值是否更新
    expect(result.current[0]).toBe('new value');
  });

  // 测试受控模式
  it('should work in controlled mode', () => {
    // 模拟onChange回调
    const onChange = vi.fn();

    // 使用受控值初始化
    const { result, rerender } = renderHook(
      (props: TestProps) => useControllableValue(props),
      {
        initialProps: { value: 'controlled value', onChange },
      },
    );

    // 检查初始值是否正确
    expect(result.current[0]).toBe('controlled value');

    // 尝试更新值
    act(() => {
      result.current[1]('new value');
    });

    // 在受控模式下，内部状态不应该改变
    expect(result.current[0]).toBe('controlled value');

    // 但onChange应该被调用
    expect(onChange).toHaveBeenCalledWith('new value');

    // 通过props更新值
    rerender({ value: 'updated controlled value', onChange });

    // 检查值是否通过props更新
    expect(result.current[0]).toBe('updated controlled value');
  });

  // 测试从非受控到受控的转换
  it('should handle transition from uncontrolled to controlled', () => {
    // 初始化为非受控
    const { result, rerender } = renderHook(
      (props: any) => useControllableValue(props),
      {
        initialProps: { defaultValue: 'default value' } as TestProps,
      },
    );

    // 检查初始值
    expect(result.current[0]).toBe('default value');

    // 更新为受控模式
    rerender({ value: 'controlled value' });

    // 值应该更新为受控值
    expect(result.current[0]).toBe('controlled value');
  });

  // 测试额外参数传递
  it('should pass additional arguments to onChange', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() => useControllableValue({ onChange }));

    // 调用handleChange并传递额外参数
    act(() => {
      result.current[1]('value', 'extra1', 'extra2');
    });

    // 检查onChange是否接收到所有参数
    expect(onChange).toHaveBeenCalledWith('value', 'extra1', 'extra2');
  });
});
