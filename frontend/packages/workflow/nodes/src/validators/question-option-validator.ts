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

import { z, ZodIssueCode } from 'zod';
import { I18n } from '@coze-arch/i18n';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';

// Custom validator to check if the array is empty and there are no duplicate values
const nonEmptyUniqueArray = z
  .array(
    z.object({
      name: z.string(),
    }),
  )
  .superRefine((val, ctx) => {
    const seenValues = new Set();

    val.forEach((item, idx) => {
      // check non-empty
      if (item.name.trim() === '') {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: I18n.t(
            'workflow_ques_option_notempty',
            {},
            '选项内容不可为空',
          ),
          path: [idx],
        });
      }

      // Check for duplicates
      if (seenValues.has(item.name)) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: I18n.t(
            'workflow_ques_ans_testrun_dulpicate',
            {},
            '选项内容不可重复',
          ),
          path: [idx],
        });
      } else {
        seenValues.add(item.name);
      }
    });
  });

export function questionOptionValidator({
  value,
}: ValidatorProps<Array<{ name?: string; id: string }>>) {
  try {
    nonEmptyUniqueArray.parse(value);
  } catch (error) {
    return JSON.stringify(error);
  }
  return true;
}
