import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, type RefExpression } from '@coze-workflow/base';

import { useVariableService } from '@/hooks';
import { type VariableTagProps } from '@/components/node-render/node-render-new/fields/variable-tag-list';

export function useSetTags(
  inputParameters: InputValueVO[] | Record<string, InputValueVO['input']> = [],
): VariableTagProps[] {
  const node = useCurrentEntity();
  const variableService = useVariableService();
  if (!Array.isArray(inputParameters)) {
    return [];
  }
  const setVariableInputs = inputParameters as unknown as {
    left: RefExpression;
    right: RefExpression;
  }[];
  return setVariableInputs
    .map(({ left }) => {
      const variable = variableService.getWorkflowVariableByKeyPath(
        left?.content?.keyPath,
        { node, checkScope: true },
      );
      if (!variable) {
        const pathLabel = left?.content?.keyPath[1];
        if (pathLabel) {
          // 有值但找不到变量
          return {
            label: pathLabel,
            invalid: true,
          };
        } else {
          // 没有值
          return;
        }
      }
      const viewType = left?.rawMeta?.type ?? variable.viewType;
      const variableTag: VariableTagProps = {
        label: variable.viewMeta?.name ?? variable.keyPath[1],
        type: viewType,
      };
      return variableTag;
    })
    .filter(Boolean) as VariableTagProps[];
}
