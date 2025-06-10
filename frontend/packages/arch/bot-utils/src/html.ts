import { type ReactNode } from 'react';

import { isString } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

export const renderHtmlTitle = (prefix?: ReactNode) => {
  const platformName = I18n.t('platform_name');
  if (isString(prefix)) {
    return `${prefix} - ${platformName}`;
  }
  return platformName;
};
