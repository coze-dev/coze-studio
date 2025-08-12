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

import { DatasetWriteParser as BaseDatasetWriteParser } from '@/form-extensions/components/dataset-write-parser';
import { useField, withField } from '@/form';

const DatasetWriteParser = props => {
  const { name, value, onChange, readonly } = useField<string[]>();

  return (
    <BaseDatasetWriteParser
      value={value as string[]}
      onChange={onChange}
      readonly={!!readonly}
      context={{
        meta: {
          name,
        },
      }}
      {...props}
    />
  );
};

export const DatasetWriteParserField = withField(DatasetWriteParser);
