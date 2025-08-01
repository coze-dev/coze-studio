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

import React, { useCallback, useState } from 'react';

import {
  TestsetSelect as OriginTestsetSelect,
  type TestsetData,
  type TestsetSelectProps as OriginTestsetSelectProps,
} from '@coze-devops/testset-manage';

import { generateTestsetData } from '../utils/generate-testset-data';
import { Provider } from './provider';

type TestsetSelectProps = Omit<
  OriginTestsetSelectProps,
  'testset' | 'onSelect'
> & {
  onSelect: (data: Record<string, unknown> | undefined) => void;
};

const TestsetSelect: React.FC<TestsetSelectProps> = ({
  onSelect,
  ...props
}) => {
  const [value, setValue] = useState<TestsetData | undefined>();
  const handleChange = useCallback((v: TestsetData | undefined) => {
    onSelect(v ? generateTestsetData(v) : v);
    setValue(v);
  }, []);
  return (
    <Provider>
      <OriginTestsetSelect {...props} testset={value} onSelect={handleChange} />
    </Provider>
  );
};

export { TestsetSelect, type TestsetSelectProps };
