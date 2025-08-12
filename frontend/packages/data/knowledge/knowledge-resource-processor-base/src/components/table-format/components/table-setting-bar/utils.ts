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

export const initIndexOptions = (length: number, start: number) => {
  const MAX_VALUE = 50;
  const limit = length > MAX_VALUE ? MAX_VALUE : length;
  const res: Array<{
    label: string;
    value: number;
  }> = [];
  for (let i = start; i < limit; i++) {
    res.push({
      label: I18n.t('datasets_createFileModel_tab_dataStarRow_value', {
        LineNumber: i + 1,
      }),
      value: i,
    });
  }
  return res;
};
