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
      // @TODO 本次只迁移代码位置，遗留的loading一直未实现，本次暂不实现。可以在二期UI改版中去实现

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
