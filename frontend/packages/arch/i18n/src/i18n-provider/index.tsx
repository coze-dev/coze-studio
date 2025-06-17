import { Component, type ReactNode } from 'react';

import { CDLocaleProvider } from '@coze-arch/coze-design/locales';

import { type Intl } from '../intl';
import { i18nContext, type I18nContext } from './context';

export { i18nContext, type I18nContext };

export interface I18nProviderProps {
  children?: ReactNode;
  i18n: Intl;
}

export class I18nProvider extends Component<I18nProviderProps> {
  constructor(props: I18nProviderProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      children,
      i18n = {
        t: (k: string) => k,
      },
    } = this.props;
    return (
      <CDLocaleProvider i18n={i18n}>
        <i18nContext.Provider value={{ i18n: i18n as Intl }}>
          {children}
        </i18nContext.Provider>
      </CDLocaleProvider>
    );
  }
}
