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

import { I18n } from '@coze-arch/i18n';

import { formatBytes } from '../utils/format-bytes';

const DEFAULT_MAX_SIZE = 1024 * 1024 * 20;

/** file size verification  */
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
