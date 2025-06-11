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
  // 固定展示的条目，最大为 10 条，不到 10 条按实际展示
  const fixedItems = useMemo(
    () => data.slice(0, fixedCount),
    [fixedCount, data],
  );
  const moreItems = useMemo(() => data.slice(fixedCount), [data]);

  // 是否需要通过下拉框展示更多
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
