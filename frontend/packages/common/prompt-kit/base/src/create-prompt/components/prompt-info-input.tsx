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

import { useEffect, useState, type ComponentProps } from 'react';

import { withField, FormInput, FormTextArea } from '@coze-arch/coze-design';

interface PromptInfoInputProps {
  readonly?: boolean;
  initCount?: number;
  value?: string;
  disabled?: boolean;
  rows?: number;
  field: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  maxCount?: number;
  rules?: ComponentProps<typeof FormInput>['rules'];
}

export const PromptInfoInput = (props: PromptInfoInputProps) => {
  const { initCount, disabled, rows } = props;
  const [count, setCount] = useState(initCount || 0);

  const handleChange = (v: string) => {
    setCount(v.length);
  };

  useEffect(() => {
    setCount(initCount || 0);
  }, [initCount]);

  const countSuffix = (
    <div className="overflow-hidden coz-fg-secondary text-sm pr-[9px]">{`${count}/${props.maxCount}`}</div>
  );

  if (disabled) {
    return <ReadonlyInput {...props} />;
  }

  if (rows && rows > 1) {
    return (
      <FormTextArea
        {...props}
        autosize
        autoComplete="off"
        onChange={(value: string) => handleChange(value)}
      />
    );
  }

  return (
    <FormInput
      {...props}
      autoComplete="off"
      suffix={countSuffix}
      onChange={value => handleChange(value)}
    />
  );
};

const ReadonlyInputCom = (props: PromptInfoInputProps) => {
  const { value } = props;
  return (
    <div className="w-full">
      <div className="coz-fg-secondary text-base break-all whitespace-pre-line">
        {value}
      </div>
    </div>
  );
};

const ReadonlyInput = withField(ReadonlyInputCom, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});
