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

import { useMemo, type FC } from 'react';

import {
  useNodeTestId,
  ValueExpression,
  ViewVariableType,
} from '@coze-workflow/base';

import {
  ValueExpressionInput,
  type ValueExpressionInputProps,
} from '@/form-extensions/components/value-expression-input';

import { type TreeNodeCustomData } from '../../types';
import { MAX_TREE_LEVEL } from '../../constants';
import { ValidationErrorWrapper } from '../../../validation/validation-error-wrapper';

import styles from './index.module.less';

interface Props {
  data: TreeNodeCustomData;
  onChange: ValueExpressionInputProps['onChange'];
  style?: React.CSSProperties;
  level: number;
  disabled?: boolean;
  disabledTypes?: ViewVariableType[];
  testName?: string;
}

export const InputValue: FC<Props> = ({
  data,
  onChange,
  style,
  level,
  disabled,
  disabledTypes,
  testName = '',
}) => {
  const finalDisabledTypes = useMemo(() => {
    // Object refs restrict type selection
    if (data.input && ValueExpression.isObjectRef(data.input)) {
      return ViewVariableType.getComplement([ViewVariableType.Object]);
    }
    // More than three levels are not allowed to select Object ArrayObject
    const levelLimitTypes =
      level >= MAX_TREE_LEVEL
        ? [ViewVariableType.Object, ViewVariableType.ArrayObject]
        : [];
    return [...new Set([...levelLimitTypes, ...(disabledTypes || [])])];
  }, [data.input, disabledTypes, level]);
  const { getNodeSetterId } = useNodeTestId();

  return (
    <ValidationErrorWrapper
      path={`${data.field?.slice(data.field.indexOf('['))}.input`}
      className={styles.container}
      style={style}
      errorCompClassName={'output-param-name-error-text'}
    >
      {options => (
        <ValueExpressionInput
          testId={getNodeSetterId(`${testName}/input`)}
          value={data?.input}
          onBlur={() => {
            // There is a problem with the timing of the validator, add setTimeout to avoid the error message flashing.
            setTimeout(() => {
              options.onBlur();
            }, 33);
          }}
          onChange={v => {
            options.onChange();
            onChange(v);
          }}
          readonly={disabled}
          disabledTypes={finalDisabledTypes}
          validateStatus={options.showError ? 'error' : 'default'}
        />
      )}
    </ValidationErrorWrapper>
  );
};
