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

import React, { useMemo, useEffect } from 'react';

import { type NodeResult } from '@coze-workflow/base/api';
import { Typography, Checkbox } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { useTestRunStatus } from '../hooks/use-test-run-status';
import { START_NODE_ID } from '../constants';
import { PageSelector } from './page-selector';

import styles from './index.module.less';

interface Props {
  value: number;
  batch: (NodeResult | null)[];

  /** Whether to show only errors */
  showError: boolean;

  /** Select index change event */
  onChange: (val: number) => void;

  /**
   * Triggered after items filtering
   * @param isEmpty is currently an empty list
   * @param showError Whether only errors are currently displayed
   * @Param needUpdate Whether to synchronize showError to backend, default synchronization
   * @returns
   */
  onFilterChange?: (
    isEmpty: boolean,
    showError: boolean,
    needUpdate?: boolean,
  ) => void;
}

export const LogNavigationV2: React.FC<Props> = ({
  value,
  batch,
  onChange,
  showError,
  onFilterChange,
}) => {
  const { disabled } = useTestRunStatus(START_NODE_ID);

  // Filtered collection
  const items = useMemo(() => {
    if (showError) {
      return batch.filter(v => Boolean(v?.errorInfo));
    }
    return batch;
  }, [batch, showError]);

  // After items are changed, the original index is selected by default or the first item is selected (starting from 0).
  useEffect(() => {
    const item = items.find(v => v?.index === value);
    if (!item && items.length > 0) {
      onChange(items?.[0]?.index ?? 0);
    }
  }, [items]);

  // First render update selected state
  useEffect(() => {
    onFilterChange?.(items.length === 0, showError, false);
  }, [items, showError, onFilterChange]);

  const errorLength = batch.filter(v => Boolean(v?.errorInfo)).length;
  return (
    <div>
      <div className={styles['flow-test-run-batch-filter']}>
        <Typography.Text className="font-semibold">
          {showError
            ? I18n.t('workflow_batch_error_items')
            : I18n.t('workflow_batch_total_items')}
          : {showError ? `${errorLength}/` : ''}
          {batch.length}
        </Typography.Text>

        <Checkbox
          checked={showError}
          disabled={disabled}
          onChange={e => {
            const checked = Boolean(e.target.checked);
            const isEmpty = checked ? errorLength === 0 : batch.length === 0;
            onFilterChange?.(isEmpty, checked, true);
          }}
          aria-label={I18n.t('workflow_batch_error_only')}
        >
          {I18n.t('workflow_batch_error_only')}
        </Checkbox>
      </div>

      <PageSelector
        batch={items}
        value={value}
        onChange={page1 => onChange(page1)}
      />
    </div>
  );
};
