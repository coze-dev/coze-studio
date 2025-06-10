/* eslint-disable @typescript-eslint/naming-convention */
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ModeToggle from '../theme-toggle';

import { type Mock } from 'vitest';

import { ThemeProvider, useTheme } from '../theme-provider';

vi.mock('../theme-provider', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: vi.fn(),
}));

describe('<ModeToggle />', () => {
  it('should renders correctly and responds to theme change', () => {
    let currentTheme = 'fake theme';
    const mockSetTheme = vi.fn().mockImplementation(theme => {
      currentTheme = theme;
    });
    (useTheme as Mock).mockReturnValue({
      theme: currentTheme,
      setTheme: mockSetTheme,
    });
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>,
    );

    const lightButton = getByTestId('btnSwitchLight');
    const darkButton = getByTestId('btnSwitchDark');

    expect(lightButton).toBeInTheDocument();
    expect(darkButton).toBeInTheDocument();
    expect(getByText(currentTheme)).toBeInTheDocument();

    // 模拟点击 "Dark" 按钮
    fireEvent.click(darkButton);
    expect(mockSetTheme).toBeCalledWith('dark');

    // 模拟点击 "Light" 按钮
    fireEvent.click(lightButton);
    expect(mockSetTheme).toBeCalledWith('light');
  });
});
