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

import { get } from 'lodash-es';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableType,
  type RefExpression,
  ValueExpressionType,
} from '@coze-workflow/base';

import { VariableSelector } from '../../components/tree-variable-selector';

import styles from './index.module.less';

interface VariableSelectOptions {
  disabledTypes?: Array<ViewVariableType>;
  forArrayItem?: boolean;
}

function VariableSelectSetter({
  value,
  onChange,
  options,
}: SetterComponentProps<RefExpression, VariableSelectOptions>): JSX.Element {
  const { disabledTypes, forArrayItem } = options;
  const handleOnChange = (innerValue: string[] | undefined) => {
    if (innerValue !== undefined) {
      onChange?.({
        type: ValueExpressionType.REF,
        content: {
          keyPath: innerValue,
        },
      });
    }
  };
  return (
    <VariableSelector
      className={styles['variable-select-setter']}
      value={get(value, 'content.keyPath') as string[]}
      onChange={handleOnChange}
      disabledTypes={disabledTypes}
      forArrayItem={forArrayItem}
    />
  );
}

export const variableSelect = {
  key: 'VariableSelect',
  component: VariableSelectSetter,
};
