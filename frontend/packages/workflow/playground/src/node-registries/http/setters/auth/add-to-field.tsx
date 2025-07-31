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

import { useNodeTestId } from '@coze-workflow/base';

// import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import InputLabel from '@/nodes-v2/components/input-label';
import { useField, withField } from '@/form';

import { CustomAuthAddToType } from '../constants';

export const AddToField = withField(({ readonly }: { readonly?: boolean }) => {
  const { value, onChange } = useField<CustomAuthAddToType>();

  const { getNodeSetterId } = useNodeTestId();

  const optionList = [
    {
      label: 'Header',
      value: CustomAuthAddToType.Header,
    },
    {
      label: 'Query',
      value: CustomAuthAddToType.Query,
    },
  ];

  return (
    <div className="flex items-center pl-[4px] gap-[4px] mt-[6px]">
      <div
        style={{
          flex: 2,
        }}
      >
        <InputLabel label="Add To" />
      </div>
      <div
        style={{
          flex: 3,
        }}
      >
        <Select
          size="small"
          data-testid={getNodeSetterId('auth-add-to-select')}
          optionList={optionList}
          value={value}
          disabled={readonly}
          style={{
            width: '100%',
            borderColor:
              'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
          }}
          onChange={v => onChange(v as CustomAuthAddToType)}
        />
      </div>
    </div>
  );
});
