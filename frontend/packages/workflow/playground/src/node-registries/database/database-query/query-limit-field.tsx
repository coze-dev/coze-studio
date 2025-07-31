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

import { type FieldProps, InputNumberField, Section } from '@/form';

export function QueryLimitField({ name }: Pick<FieldProps, 'name'>) {
  return (
    <Section title={I18n.t('workflow_query_limit_title')}>
      <InputNumberField className="w-full" name={name} defaultValue={100} />
    </Section>
  );
}
