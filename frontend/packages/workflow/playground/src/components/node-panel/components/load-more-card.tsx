import { type FC, useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowDown,
  IconCozLoading,
} from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import styles from './styles.module.less';
export const LoadMoreCard: FC<{
  onLoadMore: () => Promise<void>;
}> = ({ onLoadMore }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div
      className={styles['load-more']}
      onClick={async () => {
        try {
          setLoading(true);
          await onLoadMore?.();
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className={styles['load-more-icon']}>
        {loading ? (
          <IconCozLoading
            className={classNames(styles.icon, 'semi-spin-animate')}
          />
        ) : (
          <IconCozArrowDown className={styles.icon} />
        )}
      </div>
      <Typography.Text className={styles['load-more-text']}>
        {I18n.t('workflow_0224_05')}
      </Typography.Text>
    </div>
  );
};
