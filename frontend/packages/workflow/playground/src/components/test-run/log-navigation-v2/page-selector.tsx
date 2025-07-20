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
 
import React, { useMemo } from 'react';

import cls from 'classnames';
import { type NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import { NavigateItemDisabled, DisabledType } from './navigate-item-disabled';
import { CustomSelector } from './custom-selector';

import styles from './page-selector.module.less';

interface Props {
  fixedCount?: number;
  totalCount?: number;
  batch: (NodeResult | null)[];
  data?: NodeResult;
  value: number;
  onChange: (val: number) => void;
}

const MAX_FIXED_COUNT = 10;

export const PageSelector: React.FC<Props> = ({
  fixedCount = MAX_FIXED_COUNT,
  batch,
  onChange,
  value,
}) => {
  // 固定展示的条目，最大为 10 条，不到 10 条按实际展示
  const fixedItems = useMemo(
    () =>
      new Array(
        batch.length <= MAX_FIXED_COUNT ? batch.length : fixedCount,
      ).fill(null),
    [fixedCount, batch],
  );

  // 是否需要通过下拉框展示更多
  const hasMore = batch.length > fixedCount;

  return (
    <div style={{ display: 'flex' }}>
      <div className={styles['flow-test-run-log-pagination']}>
        {fixedItems.map((_, idx) => {
          const currentData = batch[idx];
          const currIndex = currentData?.index ?? 0;
          if (!currentData) {
            return (
              <NavigateItemDisabled key={idx} type={DisabledType.Empty}>
                {idx + 1}
              </NavigateItemDisabled>
            );
          }

          // Pending 可以当做 warning 处理，否则跟输出中的告警态对应不上
          const isWarning = ['warning', 'Pending'].includes(
            currentData?.errorLevel ?? '',
          );
          const isError = currentData?.errorInfo && !isWarning;
          return (
            <div
              key={idx}
              className={cls(styles['flow-test-run-log-pagination-item'], {
                [styles.active]: currIndex === value,
              })}
              onClick={() => onChange(currIndex)}
            >
              {currIndex + 1}
              {isError && (
                <IconAlertCircle className={styles['pagination-item-error']} />
              )}
              {isWarning && (
                <IconAlertCircle
                  className={cls(
                    styles['pagination-item-error'],
                    '!text-[#FF9600]',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <CustomSelector
          value={value < MAX_FIXED_COUNT ? undefined : value}
          items={(batch || []).slice(MAX_FIXED_COUNT)}
          placeholder={I18n.t('drill_down_placeholer_select')}
          onChange={page => {
            onChange(page);
          }}
        />
      )}
    </div>
  );
};
