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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { useState } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type InputProps } from '@coze-arch/bot-semi/Input';

import { type TreeNodeCustomData } from '../../type';
import { MAX_NAME_LENGTH } from '../../constants';
import { useOutputTreeContext } from '../../../../context';
import { ValidationErrorWrapper } from '../../../../../validation/validation-error-wrapper';
import WorkflowSLInput from '../../../../../../../ui-components/workflow-sl-input';

import styles from './index.module.less';

interface ParamNameProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (name: string) => void;
  style?: React.CSSProperties;
}

export default function ParamName({
  data,
  disabled,
  onChange,
  style,
}: ParamNameProps) {
  const { testId } = useOutputTreeContext();
  const { concatTestId } = useNodeTestId();
  const [focused, setFocused] = useState(false);

  return (
    <ValidationErrorWrapper
      path={`${data.field?.slice(data.field.indexOf('['))}.name`}
      className={styles.container}
      style={style}
      errorCompClassName={'output-param-name-error-text'}
    >
      {options =>
        disabled ? (
          <div className="w-full flex items-center h-6">
            <div className="coz-fg-primary font-medium text-xs truncate ">
              {data.name}
            </div>
          </div>
        ) : (
          <WorkflowSLInput
            className={styles.name}
            value={data.name}
            disabled={disabled}
            handleBlur={name => {
              onChange(name);
              // There is a problem with the timing of the validator, add setTimeout to avoid the error message flashing.
              setTimeout(() => {
                options.onBlur();
              }, 33);
              setFocused(false);
            }}
            handleFocus={() => {
              setFocused(true);
            }}
            handleChange={(name: string) => {
              options.onChange();
            }}
            inputProps={
              {
                placeholder: I18n.t('workflow_detail_end_output_entername'),
                disabled,
                maxLength: !disabled && focused ? MAX_NAME_LENGTH : undefined,
                'data-testid': concatTestId(
                  testId ?? '',
                  data.field,
                  'param-name',
                ),
                size: 'small',
              } as unknown as InputProps
            }
            validateStatus={options.showError ? 'error' : 'default'}
          />
        )
      }
    </ValidationErrorWrapper>
  );
}
