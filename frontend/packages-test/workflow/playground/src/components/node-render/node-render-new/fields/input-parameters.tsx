import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from './variable-tag-list';
import { useInputParametersVariableTags } from './use-input-parameters-variable-tags';
import { Field } from './field';

interface InputParametersProps {
  label?: string;
}

export function InputParameters({
  label = I18n.t('workflow_detail_node_parameter_input'),
}: InputParametersProps) {
  const { inputParameters } = useWorkflowNode();
  const variableTags = useInputParametersVariableTags(inputParameters);

  const isEmpty = !variableTags || variableTags.length === 0;

  return (
    <Field label={label} isEmpty={isEmpty}>
      <VariableTagList value={variableTags} />
    </Field>
  );
}
