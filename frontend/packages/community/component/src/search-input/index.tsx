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

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Input } from '@coze-arch/coze-design';
import { IconSearchInput } from '@coze-arch/bot-icons';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import { useSearchInputStore } from './search-input-store';
import { RecommendPopover } from './components';

import styles from './index.module.less';

interface InputProps {
  border?: boolean;
  className?: string;
  inputClassName?: string;
  defaultValue?: string;
  onSearch?: (word: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onActiveChange?: (isActive: boolean) => void;
  entityType?: ProductEntityType;
  useResponsive?: boolean;
  enableFocusStyle?: boolean;
}
export interface SearchInputRef {
  setInputValue: (value: string) => void;
}

export const SearchInput = React.forwardRef(
  (props: InputProps, ref: React.ForwardedRef<SearchInputRef>) => {
    const {
      border,
      className,
      inputClassName,
      defaultValue = '',
      onSearch,
      onFocus,
      onBlur,
      entityType,
      useResponsive,
      onActiveChange,
      enableFocusStyle = true,
    } = props;
    const [focus, setFocus] = useState<boolean>(false);
    const [inComposition, setInComposition] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const { inputValue, setInputValue, setEntityTypeIn } =
      useSearchInputStore();
    const [isResultEmpty, setIsResultEmpty] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setEntityTypeIn(entityType || ProductEntityType.SaasPlugin);
    }, [entityType]);
    useEffect(() => {
      let inputValueTemp = defaultValue;
      try {
        inputValueTemp = decodeURIComponent(defaultValue);
      } catch (_e) {
        inputValueTemp = defaultValue;
      }
      setInputValue(inputValueTemp);
      return () => {
        setInputValue('');
      };
    }, []);

    const focusInput = (isFocus: boolean) => {
      if (isFocus) {
        inputRef.current?.focus?.();
      } else {
        inputRef.current?.blur?.();
      }
    };
    useImperativeHandle(
      ref,
      () => ({
        setInputValue,
      }),
      [setInputValue],
    );
    useEffect(() => {
      onActiveChange?.(focus || visible);
    }, [focus, visible]);
    const popoverVisible = visible && (!isResultEmpty || inputValue.length > 0);
    return (
      <>
        <div
          className={cls(className, styles.container, {
            [styles.focus]: enableFocusStyle && (focus || visible),
            [styles.popoverVisible]: enableFocusStyle && popoverVisible,
          })}
          ref={inputContainerRef}
        >
          <Input
            className={cls(inputClassName, styles.inputContainer, {
              [styles['has-word']]: inputValue.length > 0,
              '!coz-stroke-plus': border,
            })}
            onChange={(val: string) => setInputValue(val)}
            value={inputValue}
            prefix={
              focus || inputValue.length > 0 ? null : (
                <div className={styles['icon-search']}>
                  <IconSearchInput />
                </div>
              )
            }
            onClick={() => {
              setVisible(true);
            }}
            showClear
            onFocus={() => {
              setFocus(true);
              onActiveChange?.(true); //这里必定会focus，加快状态变化
              onFocus?.();
            }}
            onBlur={() => {
              setFocus(false);
              if (!popoverVisible) {
                setVisible(false);
              }
              onBlur?.();
            }}
            onCompositionStart={() => {
              setInComposition(true);
            }}
            onCompositionEnd={() => {
              setInComposition(false);
            }}
            placeholder={I18n.t('Search')}
            maxLength={100}
            ref={inputRef}
            clearIcon={
              <span className={styles['clear-icon']}>
                <IconCozCross />
              </span>
            }
          />
          <RecommendPopover
            focus={focus}
            inComposition={inComposition}
            onSearch={onSearch}
            visible={popoverVisible}
            setVisible={setVisible}
            focusInput={focusInput}
            inputContainerRef={
              inputContainerRef as React.MutableRefObject<HTMLElement>
            }
            onResultEmpty={(value: boolean) => {
              setIsResultEmpty(value);
            }}
          />
        </div>
        <div
          className={cls(styles.mask, {
            [styles.visible]: popoverVisible && useResponsive,
          })}
        />
      </>
    );
  },
);
