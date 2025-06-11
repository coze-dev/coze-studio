import { FC, useContext } from 'react';

import { i18nContext, type I18nContext } from '@coze-arch/i18n/i18n-provider';
import { PaginationProps } from '@douyinfe/semi-ui/lib/es/pagination';
import { Pagination, Space } from '@douyinfe/semi-ui';
import { IconChevronRight, IconChevronLeft } from '@douyinfe/semi-icons';

import s from './index.module.less';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UIPaginationProps {}
export const UIPagination: FC<UIPaginationProps & PaginationProps> = props => {
  const { pageSize = 0, currentPage = 1, total = 0 } = props;
  const { i18n } = useContext<I18nContext>(i18nContext);
  return (
    <div className={s['ui-pagination']}>
      <Pagination
        {...props}
        nextText={
          <Space className={s['change-button']}>
            {i18n.t('Next_2')}
            <IconChevronRight />
          </Space>
        }
        prevText={
          <Space className={s['change-button']}>
            <IconChevronLeft /> {i18n.t('Previous_2')}
          </Space>
        }
      />

      <Space className={s['page-text']}>
        <div className={s['size-info']}>
          {pageSize * (currentPage - 1) + 1}-
          {pageSize * currentPage <= total ? pageSize * currentPage : total}
        </div>
        of {total} items
      </Space>
    </div>
  );
};
