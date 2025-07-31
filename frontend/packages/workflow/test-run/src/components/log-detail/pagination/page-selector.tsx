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

import { type NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

import { PageItem } from './page-item';
import { MoreSelector } from './more-selector';

import styles from './page-selector.module.less';

interface PageSelectorProps {
  paging: number;
  fixedCount?: number;
  data: (NodeResult | null)[];
  onChange: (val: number) => void;
}

const MAX_FIXED_COUNT = 10;

export const PageSelector: React.FC<PageSelectorProps> = ({
  paging,
  fixedCount = MAX_FIXED_COUNT,
  data,
  onChange,
}) => {
  // Fixed display items, the maximum is 10, less than 10 items are displayed according to the actual display
  const fixedItems = useMemo(
    () => data.slice(0, fixedCount),
    [fixedCount, data],
  );
  const moreItems = useMemo(() => data.slice(fixedCount), [data]);

  // Do you need to show more through the drop-down box?
  const hasMore = useMemo(() => data.length > fixedCount, [data, fixedCount]);

  return (
    <div style={{ display: 'flex' }} className={styles['page-selector']}>
      {fixedItems.map((item, idx) => (
        <PageItem data={item} idx={idx} paging={paging} onChange={onChange} />
      ))}

      {hasMore ? (
        <MoreSelector
          paging={paging}
          fixedCount={fixedCount}
          data={moreItems}
          placeholder={I18n.t('drill_down_placeholer_select')}
          onChange={page => {
            onChange(page);
          }}
        />
      ) : null}
    </div>
  );
};
