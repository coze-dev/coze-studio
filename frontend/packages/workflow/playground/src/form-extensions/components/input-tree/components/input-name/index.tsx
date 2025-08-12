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

import { type RefExpression } from '@coze-workflow/base';

import { NodeInputName } from '@/nodes-v2/components/node-input-name';

import { type TreeNodeCustomData } from '../../types';
import { ValidationErrorWrapper } from '../../../validation/validation-error-wrapper';

import styles from './index.module.less';

interface InputNameProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (name: string) => void;
  style?: React.CSSProperties;
  isPureText?: boolean;
  initValidate?: boolean;
  testName?: string;
}

/**
 * Enter name
 */
export function InputName({
  data,
  disabled,
  onChange,
  style,
  isPureText = false,
  testName = '',
}: InputNameProps) {
  return (
    <ValidationErrorWrapper
      path={`${data.field?.slice(data.field.indexOf('['))}.name`}
      className={styles.container}
      style={style}
      errorCompClassName={'output-param-name-error-text'}
    >
      {options => (
        <NodeInputName
          name={`${testName}/name`}
          value={data.name}
          input={data.input as RefExpression}
          inputParameters={data.inputParameters || []}
          onChange={name => {
            onChange?.(name as string);
            options.onChange();
          }}
          onBlur={() => {
            // There is a problem with the timing of the validator, add setTimeout to avoid the error message flashing.
            setTimeout(() => {
              options.onBlur();
            }, 33);
          }}
          isPureText={isPureText}
          disabled={disabled}
        />
      )}
    </ValidationErrorWrapper>
  );
}
