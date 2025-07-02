import React from 'react';

import { type Intl } from '../intl';

interface I18nContext {
  i18n: Intl;
}
const i18nContext = React.createContext<I18nContext>({
  i18n: {
    t: k => k,
  } as unknown as Intl,
});
export { i18nContext, type I18nContext };
