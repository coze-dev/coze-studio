import React, { forwardRef, useEffect, useState } from 'react';

import { cn } from '@/utils';
import { IconCozMagnifier } from '@/components/icon';

import { type SearchProps } from './search-types';
import { SearchInput } from './search-input';

import './index.css';
export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (props, ref) => {
    const {
      // @TODO 本次只迁移代码位置，遗留的loading一直未实现，本次暂不实现。可以在二期UI改版中去实现

      loading,
      onSearch,
      onChange,
      style,
      showClear = true,
      value,
      prefix,
      width = 'auto',
      hideIcon = false,
      ...rest
    } = props;
    const [localValue, setValue] = useState(props.value);
    const [isFocus, setFocusStatus] = useState(false);

    useEffect(() => {
      setValue(value);
    }, [value]);

    return (
      <SearchInput
        {...rest}
        ref={ref}
        value={localValue}
        showClear={showClear}
        style={{ ...style, width }}
        onChange={(changedValue, e) => {
          setValue(changedValue);
          onChange?.(changedValue, e);
        }}
        onBlur={() => {
          setFocusStatus(false);
        }}
        onFocus={() => {
          setFocusStatus(true);
        }}
        className={cn('coz-search', props.className)}
        prefix={
          hideIcon ? null : React.isValidElement(prefix) ? (
            prefix
          ) : (
            <div
              className={cn('coz-search-icon', {
                'coz-search-icon-active': localValue,
                '!hidden': isFocus,
              })}
            >
              <IconCozMagnifier />
            </div>
          )
        }
        onSearch={onSearch}
      />
    );
  },
);
