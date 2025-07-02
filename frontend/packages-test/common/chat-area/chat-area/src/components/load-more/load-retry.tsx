import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconRefreshOutlinedNormalized } from '@coze-arch/bot-icons';

import styles from './load-retry.module.less';

export const LoadRetry: FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className={styles.retry} onClick={onClick}>
    <IconRefreshOutlinedNormalized className={styles.icon} />
    <span className={styles.text}>{I18n.t('Coze_token_reload')}</span>
  </div>
);

LoadRetry.displayName = 'LoadRetry';
