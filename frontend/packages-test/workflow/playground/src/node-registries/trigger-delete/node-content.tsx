import { useWorkflowNode, ValueExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from '@/components/node-render/node-render-new/fields/variable-tag-list';
import { useInputParametersVariableTags } from '@/components/node-render/node-render-new/fields/use-input-parameters-variable-tags';
import { Field } from '@/components/node-render/node-render-new/fields';

import { Outputs } from '../common/components';

export function TriggerDeleteContent() {
  const { data } = useWorkflowNode();
  const variableTags = useInputParametersVariableTags({
    [I18n.t('workflow_trigger_user_create_id', {}, 'id')]:
      ValueExpression.isEmpty(data?.inputs?.inputParameters?.triggerId)
        ? undefined
        : data?.inputs?.inputParameters?.triggerId,
    [I18n.t('workflow_trigger_user_create_userid', {}, 'userId')]:
      ValueExpression.isEmpty(data?.inputs?.inputParameters?.userId)
        ? undefined
        : data?.inputs?.inputParameters?.userId,
  });

  return (
    <>
      <Field label={I18n.t('workflow_detail_node_parameter_input')}>
        <VariableTagList value={variableTags} />
      </Field>
      <Outputs />
    </>
  );
}
