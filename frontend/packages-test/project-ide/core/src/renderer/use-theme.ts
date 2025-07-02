import { useEffect, useState } from 'react';

import { ThemeService } from '../styles';
import { useIDEService } from './use-ide-service';

const useTheme = () => {
  const themeService = useIDEService<ThemeService>(ThemeService);
  const [theme, setTheme] = useState(themeService.getCurrent());

  useEffect(() => {
    const dispose = themeService.onDidThemeChange(({ next }) => {
      setTheme(next);
    });
    return () => dispose.dispose();
  }, []);

  return {
    theme,
  };
};

export { useTheme };
