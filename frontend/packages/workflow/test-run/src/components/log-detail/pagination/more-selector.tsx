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

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { isUndefined } from 'lodash-es';
import cls from 'classnames';
import { type NodeResult } from '@coze-workflow/base/api';
import {
  IconCozWarningCircleFill,
  IconCozArrowDownFill,
} from '@coze-arch/coze-design/icons';
import { Popover, Typography } from '@coze-arch/coze-design';

import { PageItem, checkHasError, checkHasWarning } from './page-item';

import s from './more-selector.module.less';

interface MoreSelectorProps {
  /**
   * Run result array
   */
  data: (NodeResult | null)[];
  /** current selection index */
  paging: number;
  fixedCount: number;

  /** placeholder */
  placeholder: string;

  /** Select index change event */
  onChange: (p: number) => void;
}

export const MoreSelector: React.FC<MoreSelectorProps> = ({
  placeholder,
  paging,
  fixedCount,
  data,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const currentItem = useMemo(
    () => data.find(v => v?.index === paging),
    [paging, data],
  );

  const hasError = useMemo(() => checkHasError(currentItem), [currentItem]);
  const hasWarning = useMemo(() => checkHasWarning(currentItem), [currentItem]);

  const handleChange = useCallback(
    (v: number) => {
      onChange(v);
      setIsOpen(false);
    },
    [onChange, setIsOpen],
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

  return (
    <Popover
      keepDOM
      trigger="custom"
      position="bottomRight"
      visible={isOpen}
      content={
        <div className={s['more-selector-content']} ref={popoverRef}>
          {data.map((v, idx) => (
            <PageItem
              data={v}
              idx={idx + fixedCount}
              paging={paging}
              onChange={handleChange}
            />
          ))}
        </div>
      }
      getPopupContainer={() => selectRef?.current || document.body}
    >
      <div
        ref={selectRef}
        className={cls({
          [s['ui-selector']]: true,
          [s['has-value']]: !isUndefined(currentItem) || isOpen,
          [s['has-error']]: hasError,
          [s['has-warning']]: hasWarning,
        })}
        onClick={() => setIsOpen(p => !p)}
      >
        {placeholder && isUndefined(currentItem) ? (
          <div className={s['ui-selector-placeholder']}>{placeholder}</div>
        ) : null}
        {!isUndefined(currentItem) && (
          <div className={s['ui-selector-content']}>
            <Typography.Text>{paging + 1}</Typography.Text>
          </div>
        )}
        <div
          className={cls({
            [s['ui-selector-icon']]: true,
            [s.selected]: isOpen,
          })}
        >
          <IconCozArrowDownFill />
        </div>

        {hasError || hasWarning ? (
          <div
            className={cls({
              [s['ui-selector-error-icon']]: hasError,
              [s['ui-selector-warning-icon']]: hasWarning,
            })}
          >
            <IconCozWarningCircleFill />
          </div>
        ) : null}
      </div>
    </Popover>
  );
};
