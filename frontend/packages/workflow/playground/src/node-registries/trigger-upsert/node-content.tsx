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

import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  useWorkflowNode,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { TriggerService } from '@/services';
import { VariableTagList } from '@/components/node-render/node-render-new/fields/variable-tag-list';
import { useInputParametersVariableTags } from '@/components/node-render/node-render-new/fields/use-input-parameters-variable-tags';
import { Field } from '@/components/node-render/node-render-new/fields';

import { Outputs } from '../common/components';
import { TriggerForm, type NodeDataVO } from './types';

export const TriggerUpsertContent = () => {
  const { inputParameters } = useWorkflowNode();
  const triggerService = useService<TriggerService>(TriggerService);
  const { triggerNodeFormMeta } = triggerService.getTriggerDynamicFormMeta();

  const { fixedInputs, dynamicInputs, bindWorkflowId } =
    inputParameters as unknown as NodeDataVO;

  const dynamicKeys = triggerNodeFormMeta.reduce((acc, d) => {
    // Cronjob needs to be specialized, take the content
    if (d.name === TriggerForm.TriggerFormCronjobName) {
      acc[d.label] = dynamicInputs?.[d.name]?.content;
    } else {
      acc[d.label] = dynamicInputs?.[d.name];
    }
    return acc;
  }, {});
  const variableTags = useInputParametersVariableTags({
    [I18n.t('workflow_trigger_user_create_id', {}, 'id')]:
      fixedInputs?.triggerId,
    [I18n.t('workflow_trigger_user_create_userid', {}, 'userId')]:
      fixedInputs?.userId,
    [I18n.t('workflow_trigger_user_create_name', {}, '名称')]:
      fixedInputs?.triggerName,
    ...dynamicKeys,
    [I18n.t('workflow_trigger_user_create_bind', {}, '绑定工作流')]: {
      content: bindWorkflowId,
      rawMeta: {
        type: ViewVariableType.String,
      },
      type: ValueExpressionType.LITERAL,
    },
  });

  return (
    <>
      <Field label={I18n.t('workflow_detail_node_parameter_input')}>
        <VariableTagList value={variableTags} />
      </Field>
      <Outputs />
    </>
  );
};
