import React, { type JSX } from 'react';

import { type Theme } from '@coze-arch/coze-design';
export interface COZTheme {
  theme: Theme;
}
interface Props extends COZTheme {
  className?: string;
  components: {
    dark: JSX.Element;
    light: JSX.Element;
  };
}
export function ThemeFactory({ theme, components, className }: Props) {
  const ComponentRender =
    theme === 'light' ? components.light : components.dark;
  return <div className={className}>{ComponentRender}</div>;
}
