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

  // Image/* matches all image types
  if (acceptList.includes('image/*') && mimeType?.startsWith?.('image/')) {
    return undefined;
  }

  if (!acceptList.includes(`.${fileExtension}`)) {
    return I18n.t('imageflow_upload_error_type', {
      type: `${acceptList.filter(Boolean).join('/')}`,
    });
  }
};
