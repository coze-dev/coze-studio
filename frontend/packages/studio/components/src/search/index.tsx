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

import { type FC, useState } from 'react';

import { useUpdateEffect } from 'ahooks';
import { UIInput } from '@coze-arch/bot-semi';
import { IconSearch } from '@douyinfe/semi-icons';

import styles from './index.module.less';

export interface SearchProps {
  defaultValue?: string;
  /** When this value changes, update the internal search content */
  refreshValue?: string;
  onSearch?: (value?: string) => void;
  placeholder?: string;

  className?: string;
  style?: React.CSSProperties;
}

export const Search: FC<SearchProps> = ({
  defaultValue,
  refreshValue,
  onSearch,
  placeholder,
  className,
  style,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useUpdateEffect(() => {
    if (inputValue !== refreshValue) {
      setInputValue(refreshValue);
    }
  }, [refreshValue]);

  return (
    <UIInput
      className={className}
      style={style}
      prefix={
        <IconSearch
          className={styles['search-icon']}
          onClick={event => {
            event.stopPropagation();
            onSearch?.(inputValue);
          }}
        />
      }
      showClear
      value={inputValue}
      onChange={setInputValue}
      placeholder={placeholder}
      onEnterPress={() => {
        onSearch?.(inputValue);
      }}
      onClear={() => {
        onSearch?.('');
      }}
    />
  );
};
