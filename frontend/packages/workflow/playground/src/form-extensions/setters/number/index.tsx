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

import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { InputNumber as InputNumberUI } from '@coze-arch/coze-design';

type InputNumberProps = SetterComponentProps;
export const InputNumber: FC<InputNumberProps> = props => {
  const { value, onChange, options, readonly } = props;

  const { key, style, ...others } = options;

  const { getNodeSetterId } = useNodeTestId();

  return (
    <InputNumberUI
      {...others}
      value={value}
      onChange={onChange}
      style={{
        ...style,
        pointerEvents: readonly ? 'none' : 'auto',
      }}
      data-testid={getNodeSetterId('number-input')}
    />
  );
};

export const number = {
  key: 'Number',
  component: InputNumber,
};
