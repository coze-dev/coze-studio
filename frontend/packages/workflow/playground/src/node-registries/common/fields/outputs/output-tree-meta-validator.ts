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

import { z } from 'zod';
import { type ZodError } from 'zod';
import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

/** Variable Naming Validation Rules */
const outputTreeValidationRule =
  /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][a-zA-Z_$0-9]*$/;

/** check logic */
// eslint-disable-next-line @typescript-eslint/naming-convention
const OutputTreeMetaSchema = z.lazy(() =>
  z
    .object({
      name: z
        .string({
          required_error: I18n.t('workflow_detail_node_error_name_empty'),
        })
        .min(1, I18n.t('workflow_detail_node_error_name_empty'))
        .regex(
          outputTreeValidationRule,
          I18n.t('workflow_detail_node_error_format'),
        ),
      children: z.array(OutputTreeMetaSchema).optional(),
    })
    .passthrough(),
);

const omitErrorBody = (value, isBatch) => {
  // Batch, remove errorBody from children
  if (isBatch) {
    return value?.map(v => ({
      ...v,
      children: v?.children?.filter(c => c?.name !== 'errorBody'),
    }));
  }
  // Single, remove errorBody from value
  return value?.filter(v => v?.name !== 'errorBody');
};

export const outputTreeMetaValidator: Validate = ({ value, formValues }) => {
  /**
   * Determine whether the error exception handling is turned on. If it is turned on, you need to filter out the errorBody and check it.
   */
  const { settingOnErrorIsOpen = false } = (get(formValues, 'settingOnError') ??
    {}) as { settingOnErrorIsOpen?: boolean };

  /**
   * According to the batch data, whether it is currently in the batch state
   */
  const batchValue = get(formValues, 'batchMode');
  const isBatch = batchValue === 'batch';

  const parsed = z
    .array(OutputTreeMetaSchema)
    .safeParse(settingOnErrorIsOpen ? omitErrorBody(value, isBatch) : value);

  if (!parsed.success) {
    const errorText = JSON.stringify((parsed as { error: ZodError }).error);
    return errorText;
  }

  return undefined;
};
