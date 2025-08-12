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
import { Select as CozSelect } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

export const InputSelect: FC<LiteralValueInputProps> = ({
  className,
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onFocus,
  placeholder,
  validateStatus,
  style,
  config,
}) => {
  const { optionsList } = config || {};

  return (
    <CozSelect
      className={classNames(className)}
      data-testid={testId}
      disabled={disabled}
      defaultValue={defaultValue as string}
      onChange={v => onChange?.(v as string)}
      optionList={optionsList}
      value={value as string}
      onFocus={onFocus}
      placeholder={
        placeholder || I18n.t('workflow_detail_node_input_entervalue')
      }
      validateStatus={validateStatus}
      style={style}
      size="small"
      dropdownClassName="text-[12px]"
    />
  );
};
