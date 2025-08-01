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

import React, { forwardRef, useEffect, useState } from 'react';

import classNames from 'classnames';
import { IconSearchInput } from '@coze-arch/bot-icons';
import { InputProps } from '@douyinfe/semi-ui/lib/es/input';

import { UISearchInput } from '../ui-search-input';

import styles from './index.module.less';

export interface UISearchProps extends InputProps {
  loading?: boolean;
  onSearch?: (value?: string) => void;
}
export const UISearch = forwardRef<HTMLInputElement, UISearchProps>(
  (props, ref) => {
    const {
      loading,
      onSearch,
      onChange,
      showClear = true,
      value,
      prefix,
      ...rest
    } = props;
    const [localValue, setValue] = useState(props.value);

    useEffect(() => {
      setValue(value);
    }, [value]);

    return (
      <UISearchInput
        {...rest}
        ref={ref}
        value={localValue}
        showClear={showClear}
        onChange={(changedValue, e) => {
          setValue(changedValue);
          onChange?.(changedValue, e);
        }}
        className={classNames(styles['ui-search'], props.className)}
        prefix={
          React.isValidElement(prefix) ? (
            prefix
          ) : (
            <div
              className={classNames(
                styles['icon-search'],
                localValue && styles.active,
              )}
            >
              <IconSearchInput />
            </div>
          )
        }
        onSearch={onSearch}
      />
    );
  },
);
