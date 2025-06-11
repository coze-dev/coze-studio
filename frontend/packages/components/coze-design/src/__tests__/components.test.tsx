import { describe } from 'vitest';

import * as Components from '../index';
import * as semiComponents from '../components/semi';
import * as formComponents from '../components/form';
import { testDataTestId } from './test-id';

describe('Components render with data-testid should be supported', () => {
  const formComp = Object.keys(formComponents);
  const semiComp = Object.keys(semiComponents);

  const BLACK_LIST = [
    'Toast',
    'ThemeProvider',
    'Menu', // semiDropDown不支持透传
    'CozStep', // semiStep不支持透传
    'CDLocaleProvider',
    'CDLocaleContext',
    ...formComp,
    ...semiComp,
  ];

  const componentEntries = Object.entries(Components).filter(
    ([name, component]) =>
      !BLACK_LIST.includes(name) &&
      !name.startsWith('use') &&
      !BLACK_LIST.includes(name) &&
      name[0] === name[0].toUpperCase(),
  );

  componentEntries.forEach(([name, comp]) => {
    describe(name, () => {
      testDataTestId(comp as unknown as React.FC, name);
    });
  });
});
