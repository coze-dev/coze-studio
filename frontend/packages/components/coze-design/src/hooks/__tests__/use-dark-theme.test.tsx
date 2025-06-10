import { renderHook } from '@testing-library/react';

import '@testing-library/jest-dom';
import { useDarkTheme } from '../use-dark-theme';

// 模拟 storybook-dark-mode
vi.mock('storybook-dark-mode', () => ({
  useDarkMode: vi.fn(),
}));

import { useDarkMode } from 'storybook-dark-mode';

describe('useDarkTheme', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应该在暗色模式下返回 "dark"', () => {
    // 模拟 useDarkMode 返回 true
    (useDarkMode as jest.Mock).mockReturnValue(true);

    // 渲染钩子
    const { result } = renderHook(() => useDarkTheme());

    // 验证返回值
    expect(result.current).toBe('dark');
    expect(useDarkMode).toHaveBeenCalledTimes(1);
  });

  it('应该在亮色模式下返回 "light"', () => {
    // 模拟 useDarkMode 返回 false
    (useDarkMode as jest.Mock).mockReturnValue(false);

    // 渲染钩子
    const { result } = renderHook(() => useDarkTheme());

    // 验证返回值
    expect(result.current).toBe('light');
    expect(useDarkMode).toHaveBeenCalledTimes(1);
  });
});
