import { isNil } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { getImageSize } from '../utils/get-image-size';
import { type FileItem } from '../types';

export interface ImageSizeRule {
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  aspectRatio?: number;
}

/** 图像宽高校验  */
// eslint-disable-next-line complexity
export const imageSizeValidate = async (
  file: FileItem,
  rule?: ImageSizeRule,
): Promise<string | undefined> => {
  const { maxWidth, minWidth, maxHeight, minHeight, aspectRatio } = rule || {};

  // 未定义时不校验
  if (isNil(maxWidth || minWidth || maxHeight || minHeight || aspectRatio)) {
    return;
  }

  const { width, height } = await getImageSize(file);

  if (maxWidth && width > maxWidth) {
    return I18n.t('imageflow_upload_error5', {
      value: `${maxWidth}px`,
    });
  }

  if (minWidth && width < minWidth) {
    return I18n.t('imageflow_upload_error3', {
      value: `${minWidth}px`,
    });
  }

  if (maxHeight && height > maxHeight) {
    return I18n.t('imageflow_upload_error4', {
      value: `${maxHeight}px`,
    });
  }

  if (minHeight && height < minHeight) {
    return I18n.t('imageflow_upload_error2', {
      value: `${minHeight}px`,
    });
  }
  if (aspectRatio && width / height > aspectRatio) {
    return I18n.t('imageflow_upload_error1');
  }
};
