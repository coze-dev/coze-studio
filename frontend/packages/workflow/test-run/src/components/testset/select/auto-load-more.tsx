import { forwardRef } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze/coze-design';

import styles from './auto-load-more.module.less';

interface LoadMoreProps {
  noMore?: boolean;
}

export const AutoLoadMore = forwardRef<HTMLDivElement, LoadMoreProps>(
  ({ noMore }, ref) => (
    <div
      className={cls(styles.container, {
        [styles['no-more']]: noMore,
      })}
      ref={ref}
    >
      <Spin spinning={true} wrapperClassName={styles.spin} />
      <div className={styles.text}>{I18n.t('loading')}</div>
    </div>
  ),
);
