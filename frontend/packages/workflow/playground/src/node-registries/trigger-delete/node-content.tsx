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
