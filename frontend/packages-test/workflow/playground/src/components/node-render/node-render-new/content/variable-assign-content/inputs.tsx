import React from 'react';

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { VariableTagList } from '../../fields/variable-tag-list';
import { Field } from '../../fields';
import { useVariableAssignTags } from './use-variable-assign-tags';

export default function Inputs() {
  const { inputParameters } = useWorkflowNode();
  const variableTags = useVariableAssignTags(inputParameters);

  const isEmpty = !variableTags || variableTags.length === 0;

  return (
    <Field
      label={I18n.t('workflow_detail_node_parameter_input')}
      isEmpty={isEmpty}
    >
      <VariableTagList value={variableTags} />
    </Field>
  );
}
