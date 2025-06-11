import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from '@/components/node-render/node-render-new/fields/variable-tag-list';
import { useInputParametersVariableTags } from '@/components/node-render/node-render-new/fields/use-input-parameters-variable-tags';
import { Field } from '@/components/node-render/node-render-new/fields';

import { useLoopType } from '../hooks';
import { LoopType } from '../constants';

interface InputParametersProps {
  label?: string;
}

export const LoopArray = ({
  label = I18n.t('workflow_detail_node_parameter_input'),
}: InputParametersProps) => {
  const workflowNode = useWorkflowNode();
  const loopType = useLoopType();
  const visible = loopType === LoopType.Array;

  const loopArrayParameters = workflowNode.inputParameters;
  const variableTags = useInputParametersVariableTags(loopArrayParameters);

  const isEmpty = !variableTags || variableTags.length === 0;

  if (!visible) {
    return <></>;
  }

  return (
    <Field label={label} isEmpty={isEmpty}>
      <VariableTagList value={variableTags} />
    </Field>
  );
};
