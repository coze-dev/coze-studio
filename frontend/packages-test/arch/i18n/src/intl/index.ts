export { type IIntlInitOptions, IntlModuleType, IntlModule } from './types';
import Intl, { IntlInstance } from './i18n-impl';

export { default as I18nCore } from './i18n';

const i18n = IntlInstance;
i18n.t = i18n.t.bind(i18n);
const i18nConstructor = Intl;

export default i18n;
export { i18n as I18n, Intl, i18nConstructor as I18nConstructor };
