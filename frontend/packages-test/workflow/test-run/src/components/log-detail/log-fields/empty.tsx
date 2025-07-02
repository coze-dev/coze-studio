import { I18n } from '@coze-arch/i18n';
import { IconCozIllusDone } from '@coze-arch/coze-design/illustrations';

import styles from './empty.module.less';

export const EmptyFiled = () => (
  <div className={styles['log-filed-empty']}>
    <IconCozIllusDone width="120" height="120" />
    <p>{I18n.t('workflow_batch_no_failed_entries')}</p>
  </div>
);
