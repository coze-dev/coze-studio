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

import { TextArea as UITextArea } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TextAreaProps = SetterComponentProps<any, { max?: number }>;

export const TextArea = ({
  value,
  onChange,
  options,
  readonly,
}: TextAreaProps) => {
  const { key, max, ...others } = options;

  return (
    <UITextArea
      {...others}
      readonly={readonly}
      value={value}
      onChange={onChange}
      maxCount={max}
      maxLength={max}
    />
  );
};

export const textArea = {
  key: 'TextArea',
  component: TextArea,
};
