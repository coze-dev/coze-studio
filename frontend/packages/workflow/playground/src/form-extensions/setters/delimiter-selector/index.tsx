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

import React, { useCallback, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type SelectProps, Toast, withField } from '@coze-arch/coze-design';
import { type SetterAbilityOptions } from '@flowgram-adapter/free-layout-editor';

import TagSelector from '../../components/tag-selector';

import styles from './style.module.less';

export interface DelimiterSelectorValue {
  value: SelectProps['value'];
  options: Array<{
    label: string;
    value: string;
    isDefault: boolean;
  }>;
}

interface Props {
  value: DelimiterSelectorValue;
  onChange: (v: DelimiterSelectorValue) => void;

  /**
   * Node engine global readonly
   */
  readonly: boolean;
  hasError?: boolean;
  children?: React.ReactNode;

  options: SetterAbilityOptions & {
    /** Whether to choose more */
    multiple: boolean;

    /** Whether to allow customization */
    enableCustom?: boolean;

    /** Maximum number of customizations */
    maxCustomLength?: number;

    /** Text box prompt */
    inputPlaceholder?: string;
  };
}

export const BaseDelimiterSelector = ({
  value: _value,
  onChange,
  readonly,
  hasError,
  options: _options,
}: Props) => {
  const {
    multiple,
    enableCustom = true,
    maxCustomLength,
    inputPlaceholder = '',
    ...restOptions
  } = _options || {};

  const [options, setOptions] = useState(_value.options);
  const [values, setValues] = useState(_value.value);

  const handleAdd = useCallback(
    async (input: string) => {
      if (!input) {
        return Promise.resolve(false);
      }

      if (options.find(item => item.value === input)) {
        Toast.warning(I18n.t('workflow_stringprocess_dulpicate_hover'));
        return Promise.resolve(false);
      }

      if (
        maxCustomLength &&
        !Number.isNaN(maxCustomLength) &&
        options.filter(item => !item.isDefault).length >= maxCustomLength
      ) {
        Toast.warning(
          I18n.t('workflow_stringprocess_max_length_item', {
            maxLength: maxCustomLength,
          }),
        );
        return Promise.resolve(false);
      }

      const newOptionList = [
        ...options,
        { label: input, value: input, isDefault: false },
      ];
      setOptions(newOptionList);
      const finalValues = multiple ? [...(values as string[]), input] : input;
      setValues(finalValues);
      onChange?.({
        value: finalValues,
        options: newOptionList,
      });

      return Promise.resolve(true);
    },
    [values, maxCustomLength, options],
  );

  const handleChange = useCallback(
    (changeValues: SelectProps['value']) => {
      setValues(changeValues);
      onChange?.({
        value: changeValues,
        options,
      });
    },
    [options],
  );

  const handleDelete = useCallback(
    async (input: string) => {
      if (!input) {
        return Promise.resolve(false);
      }

      const newOptionList = options.filter(item => item.value !== input);
      setOptions(newOptionList);
      let finalValues = values;
      if (multiple && Array.isArray(values)) {
        finalValues = (values || []).filter(item => item !== input);
      } else if (!multiple) {
        finalValues = options?.[0]?.value;
      }

      setValues(finalValues);
      onChange?.({
        value: finalValues,
        options: newOptionList,
      });

      return Promise.resolve(true);
    },
    [values, options],
  );

  return (
    <div className={styles['delimiter-selector']}>
      <TagSelector
        {...restOptions}
        value={values}
        options={options}
        onChange={handleChange}
        onAdd={handleAdd}
        onDelete={handleDelete}
        readonly={readonly}
        enableCustom={enableCustom}
        multiple={multiple}
        maxHeight={250}
        hasError={!!hasError}
        inputPlaceholder={inputPlaceholder}
      />
    </div>
  );
};

export const DelimiterSelector = withField(BaseDelimiterSelector);

export const delimiterSelectorSetter = {
  key: 'DelimiterSelector',
  component: BaseDelimiterSelector,
};
