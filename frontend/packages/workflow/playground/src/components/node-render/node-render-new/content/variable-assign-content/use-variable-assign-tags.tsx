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

import { isNil } from 'lodash-es';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/variable';
import { type InputValueVO, type RefExpression } from '@coze-workflow/base';

import { useAvailableNodeVariables } from '../../hooks/use-available-node-variables';
import { type VariableTagProps } from '../../fields/variable-tag-list';

export function useVariableAssignTags(
  inputParameters: InputValueVO[] | Record<string, InputValueVO['input']> = [],
): VariableTagProps[] {
  const node = useCurrentEntity();
  const variableService = useAvailableNodeVariables(node);

  if (!Array.isArray(inputParameters)) {
    return [];
  }

  const setVariableInputs = inputParameters as unknown as {
    left: RefExpression;
    right: ValueExpression;
  }[];

  return setVariableInputs
    .map(({ left, right }) => {
      const variableLeft = variableService.getWorkflowVariableByKeyPath(
        left?.content?.keyPath,
        { node, checkScope: true },
      );

      if (!variableLeft) {
        return {
          label: undefined,
          invalid: true,
          type: undefined,
        };
      }

      const pathLabel = left?.content?.keyPath?.[1];
      const viewType = left?.rawMeta?.type ?? variableLeft.viewType;
      if (
        right?.type === ValueExpressionType.LITERAL &&
        isNil(right?.content)
      ) {
        return {
          label: pathLabel,
          invalid: true,
          type: viewType,
        };
      }

      if (right?.type === ValueExpressionType.REF) {
        const variableRight = variableService.getWorkflowVariableByKeyPath(
          right?.content?.keyPath,
          { node, checkScope: true },
        );

        if (!variableRight) {
          return {
            label: pathLabel,
            invalid: true,
            type: viewType,
          };
        }
      }

      return {
        label: variableLeft.viewMeta?.name ?? variableLeft.keyPath[1],
        type: viewType,
      };
    })
    .filter(Boolean) as VariableTagProps[];
}
