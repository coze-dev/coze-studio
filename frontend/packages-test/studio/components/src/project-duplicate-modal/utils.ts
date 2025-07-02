import { I18n } from '@coze-arch/i18n';

export const appendCopySuffix = (name: string) =>
  `${name}(${I18n.t('duplicate_rename_copy')})`;
