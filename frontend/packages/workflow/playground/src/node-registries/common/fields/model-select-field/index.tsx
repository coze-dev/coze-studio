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

import React from 'react';

import type { IModelValue } from '@/typing';
import { Section, useField, withField } from '@/form';
import { ModelSelect } from '@/components/model-select';

function ModelSelectComp({
  title,
  tooltip,
}: {
  title?: string;
  tooltip?: string;
}) {
  const { value, onChange, readonly, name } = useField<IModelValue>();
  return (
    <Section title={title} tooltip={tooltip}>
      <ModelSelect
        name={name}
        value={value}
        onChange={e => onChange(e as IModelValue)}
        readonly={readonly}
      />
    </Section>
  );
}

export const ModelSelectField = withField(ModelSelectComp);
