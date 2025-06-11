import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';

import styles from '../index.module.less';
import { ReactComponent as IconImageBroken } from '../../assets/coz_image_broken.svg';

interface LoadErrorProps {
  onClose?: VoidFunction;
}

export const LoadError = ({ onClose }: LoadErrorProps) => (
  <div className={styles.wrapper}>
    <div className={styles.header}>
      <div className={styles.title}>
        {I18n.t('analytics_query_aigc_infopanel_title')}
      </div>
      <Button
        icon={<IconCozCross className="w-4 h-4" />}
        color="secondary"
        className="w-4 h-4"
        onClick={onClose}
      ></Button>
    </div>
    <div className={styles.body}>
      <IconImageBroken className="w-[64px] h-[64px]" />
      <span className={styles['error-txt']}>
        {I18n.t('analytics_query_aigc_errorpanel_context')}
      </span>
    </div>
    <div className={styles.footer}>
      <Button type="primary" size="default" onClick={onClose}>
        {I18n.t('analytics_query_aigc_errorpanel_ok')}
      </Button>
    </div>
  </div>
);
