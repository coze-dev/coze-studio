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

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import {
  type CommonFieldProps,
  Input,
  TextArea,
  type TextAreaProps,
  withField,
} from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface VersionDescInputProps
  extends Pick<
    TextAreaProps,
    'placeholder' | 'maxLength' | 'maxCount' | 'wrapperClassName' | 'value'
  > {
  onChange?: (value: string) => void;
  inputClassName?: string;
  textAreaClassName?: string;
  textAreaStyle?: CSSProperties;
}

const VersionDescInput: React.FC<VersionDescInputProps> = ({
  inputClassName,
  textAreaClassName,
  wrapperClassName,
  textAreaStyle,
  ...props
}) => {
  const [mode, setMode] = useState<'input' | 'textarea'>('input');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const target = textAreaRef.current;
    if (mode !== 'textarea' || !target) {
      return;
    }
    const valueLength = props.value?.length;
    target.focus();
    if (!valueLength) {
      return;
    }
    target.setSelectionRange(valueLength, valueLength);
  }, [mode]);

  if (mode === 'input') {
    return (
      <Input
        {...props}
        className={classNames(styles['desc-input'], inputClassName)}
        onFocus={() => {
          setMode('textarea');
        }}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      <TextArea
        {...props}
        ref={textAreaRef}
        className={textAreaClassName}
        style={textAreaStyle}
        autoFocus
        autosize={{ minRows: 1, maxRows: 10 }}
        onBlur={() => {
          setMode('input');
        }}
      />
    </div>
  );
};

export const FormVersionDescInput: React.FC<
  CommonFieldProps & VersionDescInputProps
> = withField(VersionDescInput);
