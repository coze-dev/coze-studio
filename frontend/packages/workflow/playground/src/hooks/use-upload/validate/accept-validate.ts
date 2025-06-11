import mime from 'mime-types';
import { I18n } from '@coze-arch/i18n';

import { getFileExtension } from '../utils';

export const acceptValidate = (fileName: string, accept?: string) => {
  if (!accept) {
    return;
  }
  const acceptList = accept.split(',');

  const fileExtension = getFileExtension(fileName);
  const mimeType = mime.lookup(fileExtension);

  // image/* 匹配所有的图片类型
  if (acceptList.includes('image/*') && mimeType?.startsWith?.('image/')) {
    return undefined;
  }

  if (!acceptList.includes(`.${fileExtension}`)) {
    return I18n.t('imageflow_upload_error_type', {
      type: `${acceptList.filter(Boolean).join('/')}`,
    });
  }
};
