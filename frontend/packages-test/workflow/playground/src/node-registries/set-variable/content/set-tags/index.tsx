import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from '@/components/node-render/node-render-new/fields/variable-tag-list';
import { Field } from '@/components/node-render/node-render-new/fields';

import { useSetTags } from './use-set-tags';

export function SetTags() {
  const { inputParameters } = useWorkflowNode();
  const variableTags = useSetTags(inputParameters);

  const isEmpty = !variableTags || variableTags.length === 0;

  return (
    <Field label={I18n.t('workflow_loop_set_variable_set')} isEmpty={isEmpty}>
      <VariableTagList value={variableTags} />
    </Field>
  );
}
