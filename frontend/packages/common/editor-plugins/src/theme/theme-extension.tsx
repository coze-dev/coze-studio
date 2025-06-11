import { useLayoutEffect } from 'react';

import { useInjector } from '@flow-lang-sdk/editor/react';

import { type Extension } from '../types';

export const ThemeExtension: React.FC<{
  themes: Extension[];
}> = ({ themes }) => {
  const injector = useInjector();
  useLayoutEffect(() => injector.inject(themes), [injector, themes]);
  return null;
};
