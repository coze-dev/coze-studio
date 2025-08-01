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

import { type ExpressionEditorTreeHelper } from '@coze-workflow/components';
import {
  type InputValueVO,
  type RefExpressionContent,
} from '@coze-workflow/base';

export function convertInputs(
  inputs: InputValueVO[],
): ExpressionEditorTreeHelper.Input[] {
  return inputs
    .map(i => {
      const res: ExpressionEditorTreeHelper.Input = {
        name: i.name ?? '',
        keyPath: [
          ...((i.input?.content as RefExpressionContent)?.keyPath || []),
        ], // Deep copy
      };

      if (i?.children?.length) {
        res.children = convertInputs(i.children);
      }

      return res;
    })
    .filter(i => !!i.name);
}
