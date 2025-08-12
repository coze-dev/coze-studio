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

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select as UISelect } from '@coze-arch/coze-design';

import { type AnyValue } from '../../setters/typings';

type SelectProps = SetterComponentProps<string>;

const Select = ({ value, onChange, options, readonly }: SelectProps) => {
  const {
    options: selectOptions,
    size = 'small',
    style = {},
    emptyContent,
  } = options;

  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const testId = concatTestId(getNodeSetterId('select'), value);

  const onSelect = React.useCallback((selectedOption: AnyValue) => {
    onChange(selectedOption);
  }, []);

  return (
    <>
      <UISelect
        size={size}
        value={value}
        style={{
          width: '100%',
          ...style,
          pointerEvents: readonly ? 'none' : 'auto',
        }}
        onChange={onSelect}
        defaultValue={selectOptions?.[0]}
        optionList={selectOptions}
        emptyContent={emptyContent || I18n.t('workflow_detail_node_nodata')}
        data-testid={testId}
      ></UISelect>
    </>
  );
};

export const select: SetterExtension = {
  key: 'Select',
  component: Select,
};
