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

/* eslint-disable @typescript-eslint/no-empty-interface */
import { type RefExpression, useNodeTestId } from '@coze-workflow/base';

import { LoopOutputSelect } from '@/form-extensions/components/loop-output-select';
import { useField, withField } from '@/form';

interface LoopOutputSelectFieldProps {}

export const LoopOutputSelectField = withField<
  LoopOutputSelectFieldProps,
  RefExpression
>(() => {
  const { name, value, onChange, readonly } = useField<RefExpression>();
  const { getNodeSetterId } = useNodeTestId();
  const testId = getNodeSetterId(name);

  return (
    <LoopOutputSelect
      value={value}
      onChange={onChange}
      readonly={readonly}
      testId={testId}
    />
  );
});
