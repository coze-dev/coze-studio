import { type FC, useState } from 'react';

import { useUpdateEffect } from 'ahooks';
import { UIInput } from '@coze-arch/bot-semi';
import { IconSearch } from '@douyinfe/semi-icons';

import styles from './index.module.less';

export interface SearchProps {
  defaultValue?: string;
  /** 当此值变化时，更新内部的搜索内容 */
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
