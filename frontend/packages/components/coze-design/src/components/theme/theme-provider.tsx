import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  changeSemiTheme?: boolean;
  changeBySystem?: boolean;
}

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  changeSemiTheme = true,
  changeBySystem = false,
  storageKey = 'coze-design-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const { body } = document;
  const root = document.documentElement;

  const updateTheme = (currentTheme: Theme) => {
    // theme 发生改变时重置theme类;
    root.classList.remove('dark', 'light');
    const finalTheme =
      currentTheme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : currentTheme;
    // 直接追加theme类
    root.classList.add(finalTheme);

    // 根据finalTheme直接设置或移除semi主题样式
    if (changeSemiTheme) {
      // 如果finalTheme是dark或light，则设置theme-mode属性，否则移除它
      if (finalTheme === 'dark' || finalTheme === 'light') {
        body.setAttribute('theme-mode', finalTheme);
      } else {
        body.removeAttribute('theme-mode');
      }
    }
  };

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const switchMode = e => {
      if (changeBySystem) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    const addListener =
      darkModeQuery?.addEventListener ?? darkModeQuery?.addListener;

    const removeListener =
      darkModeQuery?.removeEventListener ?? darkModeQuery?.removeListener;

    if (addListener) {
      addListener.call(darkModeQuery, 'change', switchMode);

      return () => {
        if (removeListener) {
          removeListener.call(darkModeQuery, 'change', switchMode);
        }
      };
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      },
    }),
    [theme],
  );

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
