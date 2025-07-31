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

import React, { useState, useMemo, useRef, useEffect } from 'react';

import { isUndefined } from 'lodash-es';
import cls from 'classnames';
import { type NodeResult } from '@coze-workflow/base/api';
import { Popover, Typography } from '@coze-arch/bot-semi';
import { IconChevronDownStroked, IconAlertCircle } from '@douyinfe/semi-icons';

import { NavigateItemDisabled, DisabledType } from './navigate-item-disabled';

import s from './custom-selector.module.less';

interface Props {
  /**
   * Run result array
   */
  items: (NodeResult | null)[];

  /** current selection index */
  value: number | undefined;

  /** placeholder */
  placeholder: string;

  /** Select index change event */
  onChange: (p: number) => void;
}

type Nilable<T> = T | undefined | null;

const { Text } = Typography;

function checkHasError(item: Nilable<NodeResult>) {
  return Boolean(item?.errorInfo) && item?.errorLevel === 'Error';
}

function checkHasWarning(item: Nilable<NodeResult>) {
  return Boolean(item?.errorInfo) && item?.errorLevel !== 'Error';
}

export const CustomSelector: React.FC<Props> = ({
  placeholder,
  value,
  items,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const currentItem = useMemo(
    () => items.find(v => v?.index === value),
    [value, items],
  );

  useEffect(() => {
    const handle = (e: Event) => {
      if (selectRef.current?.contains(e.target as Node)) {
        return;
      }

      if (!popoverRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, []);

  const popoverContent = useMemo(
    () => (
      <div className={s['ui-popover-panel']} ref={popoverRef}>
        {items.map((v, idx) => {
          const hasError = checkHasError(v);
          const hasWarning = checkHasWarning(v);

          const currentIndex = v?.index ?? 0;

          /** The numbers in the panel start at 11 */
          const START_INDEX = 11;
          if (!v) {
            return (
              <NavigateItemDisabled
                key={idx + START_INDEX}
                type={DisabledType.Empty}
              >
                {idx + START_INDEX}
              </NavigateItemDisabled>
            );
          }

          return (
            <div
              key={idx + START_INDEX}
              className={cls({
                [s['ui-box']]: true,
                [s.selected]: value === currentIndex,
              })}
              onClick={() => {
                onChange(currentIndex);
                setIsOpen(false);
              }}
            >
              <div className={s['ui-box-content']}>
                <Text>{currentIndex + 1}</Text>
              </div>
              {hasError && (
                <div className={s['ui-error-icon']}>
                  <IconAlertCircle />
                </div>
              )}

              {hasWarning && (
                <div className={s['ui-warning-icon']}>
                  <IconAlertCircle />
                </div>
              )}
            </div>
          );
        })}
      </div>
    ),
    [items, value],
  );

  const hasError = checkHasError(currentItem);
  const hasWarning = checkHasWarning(currentItem);

  return (
    <Popover
      keepDOM
      trigger="custom"
      position="bottomRight"
      visible={isOpen}
      content={popoverContent}
      getPopupContainer={() => selectRef?.current || document.body}
    >
      <div
        ref={selectRef}
        className={cls({
          [s['ui-selector']]: true,
          [s['has-value']]: !isUndefined(value) || isOpen,
          [s['has-error']]: hasError,
          [s['has-warning']]: hasWarning,
        })}
        onClick={() => setIsOpen(p => !p)}
      >
        {placeholder && isUndefined(value) && (
          <div className={s['ui-selector-placeholder']}>{placeholder}</div>
        )}
        {!isUndefined(value) && (
          <div className={s['ui-selector-content']}>
            <Typography.Text>{value + 1}</Typography.Text>
          </div>
        )}
        <div
          className={cls({
            [s['ui-selector-icon']]: true,
            [s.selected]: isOpen,
          })}
        >
          <IconChevronDownStroked />
        </div>

        {hasError && (
          <div className={s['ui-selector-error-icon']}>
            <IconAlertCircle />
          </div>
        )}

        {hasWarning && (
          <div className={s['ui-selector-warning-icon']}>
            <IconAlertCircle />
          </div>
        )}
      </div>
    </Popover>
  );
};
