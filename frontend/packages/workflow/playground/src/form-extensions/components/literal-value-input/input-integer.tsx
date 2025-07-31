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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { CozInputNumber } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';
export const InputInteger: FC<LiteralValueInputProps> = ({
  className,
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  validateStatus,
  config = {},
  style,
}) => {
  const { min, max } = config;
  return (
    <CozInputNumber
      className={classNames(className, styles['input-number'])}
      data-testid={testId}
      disabled={disabled}
      defaultValue={defaultValue as number}
      value={value as number}
      onChange={onChange}
      onBlur={e => {
        // Get the rounded value
        setTimeout(() => {
          onBlur?.(e.target.value);
        }, 15);
      }}
      onFocus={onFocus}
      placeholder={
        placeholder || I18n.t('workflow_detail_node_input_selectvalue')
      }
      precision={0.1}
      validateStatus={validateStatus}
      style={style}
      min={min}
      max={max}
      size="small"
      hideButtons
    />
  );
};
