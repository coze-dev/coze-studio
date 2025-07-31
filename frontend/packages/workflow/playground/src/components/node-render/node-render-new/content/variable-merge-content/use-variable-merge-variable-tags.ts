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

import {
  type RefExpressionContent,
  useWorkflowNode,
  VARIABLE_TYPE_ALIAS_MAP,
  ValueExpression,
} from '@coze-workflow/base';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { isOutputVariable } from '@/nodes-v2/variable-merge/utils/is-output-variable';
import { type VariableMergeFormData } from '@/nodes-v2/variable-merge/types';
import { useExecStateEntity } from '@/hooks';

import { useAvailableNodeVariables } from '../../hooks/use-available-node-variables';
import { VariableTagStatus } from '../../fields/variable-tag-list';
import { VARIABLE_TYPE_ICON_MAP } from '../../fields/constants';
import { type VariableMergeGroup } from './types';

/**
 * Get a list of variable labels for the merged variable
 * @returns
 */
export function useVariableMergeVariableTags(): VariableMergeGroup[] {
  const node = useCurrentEntity();
  const variableService = useAvailableNodeVariables(node);
  const { data } = useWorkflowNode() as { data: VariableMergeFormData };
  const execEntity = useExecStateEntity();
  const executeNodeResult = execEntity.getNodeExecResult(node.id);

  const mergeGroups = (data?.inputs?.mergeGroups || []).map(
    (mergeGroup, groupIndex) => {
      const variables = mergeGroup?.variables || [];

      const variableTags = variables
        .map((v, index) => {
          const variable = variableService.getWorkflowVariableByKeyPath(
            (v?.content as RefExpressionContent)?.keyPath,
            { node },
          );

          const isLiteral = ValueExpression.isLiteral(v);
          // Verify whether the variable is valid
          const invalid =
            !isLiteral &&
            !variableService.getWorkflowVariableByKeyPath(
              (v?.content as RefExpressionContent)?.keyPath,
              { node, checkScope: true },
            );

          // Is it the output variable of the run?
          const isOutput = isOutputVariable(
            groupIndex,
            index,
            executeNodeResult,
          );
          let label = '';
          if (isLiteral) {
            label = String(v?.content ?? '');
          } else {
            label = variable?.viewMeta?.name ?? '';
          }
          return {
            type: v?.rawMeta?.type ?? variable?.viewType,
            label,
            invalid,
            status: isOutput ? VariableTagStatus.Success : undefined,
          };
        })
        .filter(v => v.type && VARIABLE_TYPE_ICON_MAP[v.type]);

      // Type Take the type of the first variable
      const type = variableTags[0]?.type;
      const label = type ? VARIABLE_TYPE_ALIAS_MAP[type] : '';

      return {
        name: mergeGroup.name,
        label: label || '-',
        type,
        variableTags,
      };
    },
  );

  return mergeGroups;
}
