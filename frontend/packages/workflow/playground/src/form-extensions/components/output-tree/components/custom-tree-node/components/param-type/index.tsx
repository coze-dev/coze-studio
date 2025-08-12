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

import classNames from 'classnames';
import {
  FILE_TYPES,
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
  useNodeTestId,
} from '@coze-workflow/base';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { type SelectProps } from '@coze-arch/bot-semi/Select';

import { VariableTypeSelector } from '@/form-extensions/components/variable-type-selector';

import { type TreeNodeCustomData } from '../../type';
import { useOutputTreeContext } from '../../../../context';
import { ValidationErrorWrapper } from '../../../../../validation/validation-error-wrapper';
import { VARIABLE_TYPE_ICONS_MAP } from './constants';

import styles from './index.module.less';

interface ParamTypeProps {
  data: TreeNodeCustomData;
  level: number;
  onSelectChange?: SelectProps['onChange'];
  disabled?: boolean;
  /** Types not supported */
  disabledTypes?: ViewVariableType[];
  /** hidden type */
  hiddenTypes?: ViewVariableType[];
  style?: React.CSSProperties;
}

const defaultDisabledTypes = [];
// Currently only the start node supports declaring file type variables
const defaultHiddenTypes = FILE_TYPES;

export default function ParamType({
  data,
  onSelectChange,
  level,
  disabled,
  disabledTypes = defaultDisabledTypes,
  hiddenTypes = defaultHiddenTypes,
  style,
}: ParamTypeProps) {
  const { testId } = useOutputTreeContext();
  const { concatTestId } = useNodeTestId();

  const [focused, setFocused] = useState(false);

  return (
    <ValidationErrorWrapper
      path={`${data.field?.slice(data.field.indexOf('['))}.type`}
      className={styles.container}
      style={style}
      errorCompClassName={'output-param-name-error-type'}
    >
      {options =>
        disabled ? (
          <div className="flex items-center w-full h-6">
            <div className="coz-fg-secondary font-medium text-xs truncate  coz-mg-plus px-1 py-0.5 rounded-[5px]">
              {VARIABLE_TYPE_ALIAS_MAP[data.type] || ''}
            </div>
          </div>
        ) : (
          <VariableTypeSelector
            value={data.type}
            level={level}
            disabled={disabled}
            disabledTypes={disabledTypes}
            hiddenTypes={hiddenTypes}
            onChange={val => {
              let newVal = val;
              if (Array.isArray(val)) {
                newVal = val[val.length - 1];
              }
              onSelectChange?.(newVal);
              options.onChange();
            }}
            onBlur={() => {
              setFocused(false);
              options.onBlur();
            }}
            onFocus={() => setFocused(true)}
            validateStatus={options.showError ? 'error' : 'default'}
          >
            <div
              className={classNames('w-full', {
                'bg-transparent': !disabled,
                'bg-[--semi-color-disabled-fill]': disabled,
              })}
            >
              <Tooltip
                style={{ pointerEvents: 'none' }}
                content={VARIABLE_TYPE_ALIAS_MAP[data.type]}
              >
                <div
                  data-testid={concatTestId(
                    testId ?? '',
                    data.field,
                    'param-type-select',
                  )}
                  className={classNames(
                    `flex items-center justify-between gap-0.5 pl-[3px] pr-[3px] rounded-[6px] ${
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`,
                    'border border-solid bg-transparent',
                    {
                      'semi-input-wrapper-error': options.showError,
                      'coz-stroke-plus': !options.showError && !disabled,
                      '!bg-transparent': focused,
                      '!coz-stroke-hglt': focused && !options.showError,
                      'border-stroke': disabled,
                    },
                    'hover:coz-mg-primary-hovered',
                    'semi-input-wrapper semi-input-wrapper-small',
                  )}
                >
                  <div className="coz-fg-primary truncate text-xs gap-1 items-center flex">
                    <div className="h-[12px] flex-grow coz-fg-secondary text-[16px] flex items-center">
                      {VARIABLE_TYPE_ICONS_MAP[data.type]}
                    </div>
                    <div className="truncate">
                      {VARIABLE_TYPE_ALIAS_MAP[data.type]}
                    </div>
                  </div>
                  <IconCozArrowDown className="coz-fg-secondary min-w-[16px] text-[16px]" />
                </div>
              </Tooltip>
            </div>
          </VariableTypeSelector>
        )
      }
    </ValidationErrorWrapper>
  );
}
