/**
 * 批处理的分页器
 */
import React, { useMemo } from 'react';

import { type NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { Typography, Checkbox } from '@coze-arch/coze-design';

import { PageSelector } from './page-selector';

import styles from './pagination.module.less';

interface LogDetailPaginationProps {
  paging: number;
  data: (NodeResult | null)[];
  onlyShowError: boolean;
  disabled?: boolean;
  fixedCount?: number;
  onChange: (page: number) => void;
  onShowErrorChange: (v: boolean) => void;
}

export const LogDetailPagination: React.FC<LogDetailPaginationProps> = ({
  paging,
  data,
  onlyShowError,
  disabled,
  fixedCount,
  onChange,
  onShowErrorChange,
}) => {
  const items = useMemo(() => {
    if (onlyShowError) {
      return data.filter(v => Boolean(v?.errorInfo));
    }
    return data;
  }, [data, onlyShowError]);

  const title = useMemo(() => {
    if (onlyShowError) {
      return `${I18n.t('workflow_batch_error_items')}: ${items.length}/${
        data.length
      }`;
    }
    return `${I18n.t('workflow_batch_total_items')}: ${data.length}`;
  }, [data, items, onlyShowError]);

  return (
    <div>
      <div className={styles['pagination-header']}>
        <Typography.Text className="font-semibold">{title}</Typography.Text>

        <Checkbox
          checked={onlyShowError}
          disabled={disabled}
          onChange={e => {
            const checked = Boolean(e.target.checked);
            onShowErrorChange(checked);
          }}
          aria-label={I18n.t('workflow_batch_error_only')}
        >
          {I18n.t('workflow_batch_error_only')}
        </Checkbox>
      </div>

      <PageSelector
        data={items}
        paging={paging}
        onChange={onChange}
        fixedCount={fixedCount}
      />
    </div>
  );
};
