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
