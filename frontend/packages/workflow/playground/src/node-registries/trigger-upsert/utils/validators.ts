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

import { isUndefined } from 'lodash-es';
import { ValueExpression } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

export const undefinedChecker = value => {
  let rs = true;
  if (isUndefined(value) || value === '') {
    rs = false;
  }

  if (
    ValueExpression.isExpression(value as ValueExpression) &&
    ValueExpression.isEmpty(value as ValueExpression)
  ) {
    rs = false;
  }

  /**
   * Verify that the value of cronjob is empty
   * {
   *   type: 'selecting',
   *   content: ValueExpression
   * }
   */
  if (
    (
      value as {
        content: ValueExpression;
      }
    )?.content &&
    ValueExpression.isExpression(
      (
        value as {
          content: ValueExpression;
        }
      )?.content as ValueExpression,
    ) &&
    ValueExpression.isEmpty(
      (
        value as {
          content: ValueExpression;
        }
      )?.content as ValueExpression,
    )
  ) {
    rs = false;
  }
  return rs
    ? undefined
    : I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空');
};
