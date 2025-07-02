import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from './variable-tag-list';
import { useOutputsVariableTags } from './use-outputs-variable-tags';
import { Field } from './field';

interface OutputsProps {
  label?: string;
}

/**
 * 节点输出
 */
export function Outputs({
  label = I18n.t('workflow_detail_node_output'),
}: OutputsProps) {
  const { outputs } = useWorkflowNode();
  const variableTags = useOutputsVariableTags(outputs);

  const isEmpty = !variableTags || variableTags.length === 0;

  return (
    <Field label={label} isEmpty={isEmpty}>
      <VariableTagList value={variableTags} />
    </Field>
  );
}
