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

import React, { useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { useForm } from '@flowgram-adapter/free-layout-editor';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { useWorkflowModels } from '@/hooks';
import { FormCard } from '@/form-extensions/components/form-card';
import { CopyButton } from '@/components/copy-button';

export const UserPrompt = ({ field, fieldState }) => {
  const form = useForm();
  const readonly = useReadonly();
  const { models } = useWorkflowModels();

  const modelType = form.getValueIn('model.modelType');
  const curModel = models?.find(model => model.model_type === modelType);
  const isUserPromptRequired = curModel?.is_up_required ?? false;

  useEffect(() => {
    // TODO: Temporary solution, replaced after the node engine provides a new API
    field._fieldModel.validate();
  }, [isUserPromptRequired]);

  return (
    <FormCard
      key={'FormCard'}
      header={I18n.t('workflow_detail_llm_prompt')}
      tooltip={I18n.t('workflow_detail_llm_prompt_tooltip')}
      required={isUserPromptRequired}
      actionButton={
        readonly ? [<CopyButton value={field?.value as string} />] : []
      }
    >
      <ExpressionEditor
        placeholder={I18n.t('workflow_detail_llm_prompt_content')}
        maxLength={500}
        {...field}
        inputParameters={form.getValueIn('$$input_decorator$$.inputParameters')}
        key="ExpressionEditor"
        isError={!!fieldState?.errors?.length}
      />
      <FormItemFeedback errors={fieldState?.errors} />
    </FormCard>
  );
};
