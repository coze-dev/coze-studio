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
