import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze/coze-design';

import styles from './input-form-empty.module.less';

export const InputFormEmpty = () => (
  <div className={styles['input-form-empty']}>
    <Typography.Text className={'text-[12px] coz-fg-dim'}>
      {I18n.t('workflow_testrun_input_form_empty')}
    </Typography.Text>
  </div>
);
