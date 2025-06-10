import React from 'react';

import { IconCozMoon, IconCozSun } from '@/components/icon';

import { Button } from '../button';
import { useTheme, type Theme } from './theme-provider';

function ModeToggle() {
  // 这是个 bad case，应该返回数组
  const { theme, setTheme } = useTheme();

  const handleChangeTheme = (currentTheme: Theme) => {
    setTheme(currentTheme);
  };

  return (
    <div>
      <div className="mb-4">
        current theme: <span className="text-foreground">{theme}</span>
      </div>
      <div className="flex mb-6 space-x-2">
        <Button
          color="brand"
          className="bg-background-4 text-foreground hover:bg-background-5 active:bg-background-6"
          icon={<IconCozSun className="fill-foreground text-xxl" />}
          data-testid="btnSwitchLight"
          onClick={() => handleChangeTheme('light')}
        >
          Light
        </Button>
        <Button
          className="bg-foreground-5 text-background hover:bg-foreground-4 active:bg-foreground-5"
          icon={<IconCozMoon className="fill-background text-xxl" />}
          color="brand"
          data-testid="btnSwitchDark"
          onClick={() => handleChangeTheme('dark')}
        >
          Dark
        </Button>
      </div>
    </div>
  );
}

export default ModeToggle;
