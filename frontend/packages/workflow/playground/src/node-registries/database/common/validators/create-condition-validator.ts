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

import { WorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { DatabaseNodeService, ValueExpressionService } from '@/services';

export const createConditionValidator = (conditionFieldPath: string) => ({
  [`${conditionFieldPath}.*.left`]: ({ value }) => {
    if (value === undefined) {
      return I18n.t('workflow_detail_node_error_empty');
    }
  },
  [`${conditionFieldPath}.*.operator`]: ({ value }) => {
    if (value === undefined) {
      return I18n.t('workflow_detail_condition_condition_empty');
    }
  },
  [`${conditionFieldPath}.*.right`]: ({ name, value, context }) => {
    const node = new WorkflowNode(context.node);
    const conditionPathName = name.replace('.right', '');
    const condition = node.getValueByPath(conditionPathName);
    const databaseNodeService = context.node.getService(DatabaseNodeService);
    const valueExpressionService = context.node.getService(
      ValueExpressionService,
    );

    // If no rvalue is required, skip the verification
    if (
      databaseNodeService.checkConditionOperatorNoNeedRight(condition?.operator)
    ) {
      return;
    }

    if (value === undefined) {
      return I18n.t('workflow_detail_node_error_empty');
    }

    // Check if the reference variable is deleted
    if (
      valueExpressionService.isRefExpression(value) &&
      !valueExpressionService.isRefExpressionVariableExists(value, context.node)
    ) {
      return I18n.t('workflow_detail_variable_referenced_error');
    }
  },
});
