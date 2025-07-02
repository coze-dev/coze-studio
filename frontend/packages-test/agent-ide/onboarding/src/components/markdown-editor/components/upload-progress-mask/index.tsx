import { I18n } from '@coze-arch/i18n';
import { Progress } from '@coze-arch/bot-semi';

import { type UploadState } from '../../type';

import styles from './index.module.less';

export const UploadProgressMask: React.FC<UploadState> = ({
  fileName,
  percent,
}) => (
  <div className={styles.mask}>
    <div className={styles.text}>
      {I18n.t('uploading_filename', { filename: fileName })}
    </div>
    <Progress className={styles.progress} percent={percent} />
  </div>
);
