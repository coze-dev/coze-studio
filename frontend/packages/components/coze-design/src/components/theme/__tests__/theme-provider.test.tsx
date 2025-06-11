/* eslint-disable @typescript-eslint/naming-convention */
import '@testing-library/jest-dom';
import { render, act, fireEvent, renderHook } from '@testing-library/react';

import { ThemeProvider, useTheme } from '../theme-provider';

// 用一个 TestComponent 来测试 useTheme hook 和主题设置功能.
const TestComponent = () => {
  const { theme, setTheme } = useTheme();

  // 定义一个函数来触发主题切换
  function handleClick() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  const handleChange = e => {
    const { value } = e.target;
    if (value) {
      setTheme(value);
    }
  };

  return (
    <div>
      <p data-testid="themeLabel">{theme}</p>
      <input data-testid="themeInput" type="text" onChange={handleChange} />
      <button data-testid="btnSwitch" onClick={handleClick}>
        Switch Theme
      </button>
    </div>
  );
};

describe('<ThemeProvider />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders correctly and responds to theme switch', () => {
    const mockSetItem = vi.fn();
    vi.stubGlobal('localStorage', {
      setItem: mockSetItem,
      getItem: vi.fn().mockReturnValue(undefined),
    });
    const { getByTestId } = render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    // 检查默认主题状态
    const themeLabel = getByTestId('themeLabel');
    expect(themeLabel).toBeInTheDocument();
    expect(themeLabel.textContent).toBe('light');

    // 模拟点击 "Switch Theme" 按钮
    const switchButton = getByTestId('btnSwitch');
    act(() => {
      fireEvent.click(switchButton);
    });

    // 检查主题是否已经改变为 "dark"
    expect(themeLabel.textContent).toBe('dark');
    expect(mockSetItem.mock.calls[0][1]).toBe('dark');

    act(() => {
      fireEvent.click(switchButton);
    });
    expect(themeLabel.textContent).toBe('light');
    expect(mockSetItem.mock.calls[1][1]).toBe('light');
  });

  it('should read cache them first', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-theme'),
    });
    const { getByTestId } = render(
      <ThemeProvider defaultTheme="light" storageKey="mock-cache-key">
        <TestComponent />
      </ThemeProvider>,
    );

    // 从 localStorage 读取主题
    const themeLabel = getByTestId('themeLabel');
    expect(themeLabel).toBeInTheDocument();
    expect(themeLabel.textContent).toBe('mock-theme');
  });

  it('applies theme to document.documentElement', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.className).toEqual('mock-theme dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.className).toEqual('mock-theme light');
  });

  it('applies system dark theme to documentElement', () => {
    // 假设用户的系统主题偏好是 'dark'
    window.matchMedia = vi.fn().mockImplementation(query => {
      const matches = query === '(prefers-color-scheme: dark)';
      return {
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    const wrapper = ({ children }) => (
      <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('system');
    });

    // 由于用户的系统主题偏好是 'dark'，所以 document.documentElement.className 应该被设置为 'dark'
    expect(document.documentElement.className).toMatch('dark');
  });

  it('applies system light theme to documentElement', () => {
    // 假设用户的系统主题偏好是 'light'
    window.matchMedia = vi.fn().mockImplementation(query => {
      const matches = query === '(prefers-color-scheme: light)';
      return {
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    const wrapper = ({ children }) => (
      <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('system');
    });

    // 由于用户的系统主题偏好是 'light'，所以 document.documentElement.className 应该被设置为 'light'
    expect(document.documentElement.className).toMatch('light');
  });

  it('applies the correct theme mode to the body', () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.body.getAttribute('theme-mode')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.body.getAttribute('theme-mode')).toBe('light');
  });

  it('should add event listener on mount and remove on unmount', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation(query => {
      const matches = query === '(prefers-color-scheme: dark)';
      return {
        matches,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      };
    });

    const { unmount } = render(
      <ThemeProvider defaultTheme="system" changeBySystem={true}>
        <div>content</div>
      </ThemeProvider>,
    );

    // 模拟事件变化并调用回调函数
    const mockCallback = mockAddEventListener.mock.calls[0][1];
    mockCallback({ matches: true });

    // 卸载组件
    unmount();

    // 检查 removeEventListener 是否被调用
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });
});
