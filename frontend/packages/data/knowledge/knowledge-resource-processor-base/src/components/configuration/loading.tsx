import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze-arch/coze-design';

import styles from './index.module.less';

export const ConfigurationLoading = () => (
  <div className={styles.loading}>
    <Spin spinning></Spin>
    <div className={styles['loading-content']}>
      {I18n.t('knowledge_1221_03')}
    </div>
  </div>
);
