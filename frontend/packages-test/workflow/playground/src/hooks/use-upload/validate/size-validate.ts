import { I18n } from '@coze-arch/i18n';

import { formatBytes } from '../utils/format-bytes';

const DEFAULT_MAX_SIZE = 1024 * 1024 * 20;

/** 文件大小校验  */
export const sizeValidate = (
  size: number,
  maxSize: number = DEFAULT_MAX_SIZE,
): string | undefined => {
  if (maxSize && size > maxSize) {
    return I18n.t('imageflow_upload_exceed', {
      size: formatBytes(maxSize),
    });
  }
};
