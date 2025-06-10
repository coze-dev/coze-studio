import { ThemeFactory, type COZTheme } from '../factory';
import { SearchNoResultLight } from './SearchNoResultLight';
import { SearchNoResultDark } from './SearchNoResultDark';

import s from './index.module.less';

export function SearchNoMask({ theme }: COZTheme) {
  return (
    <ThemeFactory
      className={s['search-no-mask']}
      theme={theme}
      components={{
        dark: <SearchNoResultDark />,
        light: <SearchNoResultLight />,
      }}
    />
  );
}
