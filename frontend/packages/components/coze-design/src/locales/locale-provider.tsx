import { createContext, useContext, useMemo } from 'react';

import { zh_CN } from './zh_CN';
import type { Locale } from './interface';

interface SimpleI18n {
  t: (t: string) => string;
}
export interface LocaleContextProps {
  locale?: Locale;
  i18n?: SimpleI18n;
}

export const defaultConfig: LocaleContextProps = {
  locale: zh_CN,
};

export const CDLocaleContext = createContext<LocaleContextProps>(defaultConfig);

export const CDLocaleProvider: React.FC<
  LocaleContextProps & {
    children: React.ReactNode;
  }
> = ({ locale, i18n, children }) => {
  const _i18n = useMemo<SimpleI18n>(() => {
    if (typeof i18n?.t === 'function') {
      return i18n;
    } else if (typeof locale === 'object') {
      return { t: (key: string) => locale[key] };
    }
    throw new Error('locale or i18n is required');
  }, [locale, i18n]);

  return (
    <CDLocaleContext.Provider value={{ i18n: _i18n }}>
      {children}
    </CDLocaleContext.Provider>
  );
};

export const useCDLocale = () => {
  const context = useContext(CDLocaleContext);
  if (!context) {
    throw new Error('useCDLocale must be used within a CDLocaleProvider');
  }
  return { i18n: context.i18n as SimpleI18n };
};
