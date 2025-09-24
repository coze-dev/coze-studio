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

import { Field, type FieldRenderProps, useForm } from '@flowgram-adapter/free-layout-editor';
import { I18n } from '@coze-arch/i18n';

import { CopyButton } from '@/components/copy-button';
import { FormCard } from '@/form-extensions/components/form-card';
import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { useReadonly } from '@/nodes-v2/hooks/use-readonly';

import { DYNAMIC_INPUTS_PATH } from '../constants';

interface QueryInputFieldProps {
  name: string;
}

export function QueryInputField({ name }: QueryInputFieldProps) {
  const form = useForm();
  const readonly = useReadonly();

  return (
    <Field name={name} defaultValue="">
      {({ field, fieldState }: FieldRenderProps<string>) => {
        const dynamicInputs = form.getValueIn(DYNAMIC_INPUTS_PATH) ?? [];
        return (
          <FormCard
            header={I18n.t('用户提示词')}
            tooltip={I18n.t('定义发送给智能体的提示词内容，支持引用动态参数变量。此内容将传递给 HiAgent 的 Query 字段')}
            required
            actionButton={readonly ? [<CopyButton value={field.value ?? ''} />] : []}
          >
            <ExpressionEditor
              {...field}
              placeholder={I18n.t('请输入提示词内容，可使用 {{参数名}} 引用动态参数')}
              inputParameters={dynamicInputs}
              isError={!!fieldState?.errors?.length}
              maxLength={5000}
            />
            <FormItemFeedback errors={fieldState?.errors} />
          </FormCard>
        );
      }}
    </Field>
  );
}

