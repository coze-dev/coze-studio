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

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { Input as UIInput } from '@coze-arch/coze-design';

function Input({
  value,
  onChange,
  options,
}: SetterComponentProps): JSX.Element {
  const { style } = options;
  const { getNodeSetterId } = useNodeTestId();
  const onValueChange = React.useCallback(
    (innerValue: string) => {
      onChange(innerValue);
    },
    [value, onChange],
  );
  return (
    <div style={style}>
      <UIInput
        value={value}
        onChange={onValueChange}
        data-testid={getNodeSetterId('input')}
      />
    </div>
  );
}

export const input = {
  key: 'Input',
  component: Input,
};
