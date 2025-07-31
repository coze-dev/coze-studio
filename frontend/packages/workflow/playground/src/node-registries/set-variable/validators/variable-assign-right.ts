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

/* eslint-disable  @typescript-eslint/naming-convention*/
import { type Validate } from '@flowgram-adapter/free-layout-editor';
import type { RefExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { valueExpressionValidator } from '@/form-extensions/validators';

import { getLeftRightVariable } from '../utils';

export const VariableAssignRightValidator: Validate<RefExpression> =
  (params => {
    const { context, value, name } = params;
    const { playgroundContext, node } = context;
    const valueExpressionValid = valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required: true,
    });

    if (valueExpressionValid) {
      return valueExpressionValid;
    }

    const { right } = getLeftRightVariable({ node, name, playgroundContext });

    if (!right) {
      return I18n.t('workflow_detail_node_error_empty');
    }

    return true;
  }) as Validate<RefExpression>;
