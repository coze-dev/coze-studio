import { useCallback } from 'react';

import { isObject, toString } from 'lodash-es';
import copy from 'copy-to-clipboard';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

const SPACE = 2;

export function useCopy(source: unknown) {
  const handleCopy = useCallback(() => {
    try {
      const text = isObject(source)
        ? JSON.stringify(source, undefined, SPACE)
        : toString(source);
      copy(text);
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
    } catch (e) {
      logger.error(e);
      Toast.error(I18n.t('copy_failed'));
    }
  }, [source]);

  return {
    handleCopy,
  };
}
