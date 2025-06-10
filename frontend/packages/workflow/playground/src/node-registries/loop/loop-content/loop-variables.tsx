import { StandardNodeType, useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from '@/components/node-render/node-render-new/fields/variable-tag-list';
import { useInputParametersVariableTags } from '@/components/node-render/node-render-new/fields/use-input-parameters-variable-tags';
import { Field } from '@/components/node-render/node-render-new/fields';

export const LoopVariables = () => {
  const { data, type } = useWorkflowNode();
  const variableTags = useInputParametersVariableTags(
    data?.inputs?.variableParameters,
  );

  // 非 Loop 节点没有变量定义
  if (type !== StandardNodeType.Loop) {
    return null;
  }

  const label = I18n.t('workflow_loop_loop_variables');

  const isEmpty = !variableTags || variableTags.length === 0;

  return (
    <Field label={label} isEmpty={isEmpty}>
      <VariableTagList value={variableTags} />
    </Field>
  );
};
