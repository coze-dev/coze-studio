/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
