/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

/** image width check  */
// eslint-disable-next-line complexity
export const imageSizeValidate = async (
  file: FileItem,
  rule?: ImageSizeRule,
): Promise<string | undefined> => {
  const { maxWidth, minWidth, maxHeight, minHeight, aspectRatio } = rule || {};

  // No validation when undefined
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
