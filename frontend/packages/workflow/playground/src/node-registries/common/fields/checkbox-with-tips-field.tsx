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

import { Checkbox } from '@/form-extensions/components/checkbox';
import { useField, withField } from '@/form';

export const CheckboxWithTipsField = withField(
  ({ text, itemTooltip }: { text: string; itemTooltip?: string }) => {
    const { name, value, onChange, readonly } = useField<boolean>();
    const context = { meta: { name } };
    const options = {
      text,
      itemTooltip,
    };
    return (
      <Checkbox
        options={options}
        context={context}
        value={!!value}
        onChange={(v: boolean) => onChange(v)}
        readonly={!!readonly}
      />
    );
  },
);
