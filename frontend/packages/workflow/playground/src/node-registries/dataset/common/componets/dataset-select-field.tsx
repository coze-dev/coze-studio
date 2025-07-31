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

import { DatasetSelect as BaseDatasetSelect } from '@/form-extensions/components/dataset-select';
import { useField, withField } from '@/form';

const DatasetSelect = () => {
  const { value, onChange, readonly, onBlur } = useField<string[]>();

  return (
    <BaseDatasetSelect
      value={value as string[]}
      onChange={v => {
        onChange(v);
        onBlur?.();
      }}
      readonly={!!readonly}
    />
  );
};

export const DatasetSelectField = withField(DatasetSelect);
