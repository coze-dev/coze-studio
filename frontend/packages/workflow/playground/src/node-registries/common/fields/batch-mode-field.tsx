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

import { BatchMode } from '@/nodes-v2/components/batch-mode';
import { useField, withField } from '@/form';

export const BatchModeField = withField<{}, string>(() => {
  const { name: fieldName, value, onChange, onBlur } = useField<string>();
  return (
    <BatchMode
      name={fieldName}
      value={value}
      onChange={e => {
        onChange?.((e as React.ChangeEvent<HTMLInputElement>).target.value);
        onBlur?.();
      }}
      onBlur={onBlur}
    />
  );
});
