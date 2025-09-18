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

import { I18n } from '@coze-arch/i18n';

import { FieldLayout, Section, TextareaField } from '@/form';

interface QueryInputFieldProps {
  name: string;
  title?: string;
  tooltip?: string;
}

export function QueryInputField({
  name,
  title = I18n.t('查询内容'),
  tooltip = I18n.t('填写发送给智能体的查询内容，支持变量引用'),
}: QueryInputFieldProps) {
  return (
    <Section title={title} tooltip={tooltip}>
      <FieldLayout
        label={I18n.t('Query')}
        required
        tooltip={I18n.t('支持模板变量，例如 {{inputs.user_query}}')}
      >
        <TextareaField
          name={name}
          placeholder={I18n.t('请输入智能体查询内容')}
          minRows={3}
          maxRows={6}
        />
      </FieldLayout>
    </Section>
  );
}
