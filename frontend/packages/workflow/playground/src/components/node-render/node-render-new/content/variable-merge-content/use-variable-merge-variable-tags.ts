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
 * 获取合并变量的变量标签列表
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
          // 校验变量是否有效
          const invalid =
            !isLiteral &&
            !variableService.getWorkflowVariableByKeyPath(
              (v?.content as RefExpressionContent)?.keyPath,
              { node, checkScope: true },
            );

          // 是否为运行的输出变量
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

      // 类型取第一个变量的类型
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
