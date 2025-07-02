import { useState } from 'react';

import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import styles from '../index.module.less';
import { fetchResource, downloadFile } from '../../utils/download';
import { ReactComponent as IconImageBroken } from '../../assets/not-support.svg';

interface LoadErrorProps {
  onClose?: VoidFunction;
  url: string;
  filename?: string;
}

export const NotSupport = ({ onClose, url, filename }: LoadErrorProps) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await fetchResource(url);
      downloadFile(blob, filename);
      setLoading(false);
    } catch (error) {
      logger.error({
        eventName: 'LoadError-page',
        error: error as Error,
      });
      setLoading(false);
    }
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18n.t('analytics_query_aigc_inforpanel_title_file')}
        </div>
        <Button
          icon={<IconCozCross className="w-4 h-4" />}
          color="secondary"
          className="w-4 h-4"
          onClick={onClose}
        ></Button>
      </div>
      <div className={styles.body}>
        <IconImageBroken className="w-[200px] h-[200px]" />
        <span className={styles['error-txt']}>
          {I18n.t('analytics_query_aigc_infopanel_context')}
        </span>
      </div>
      <div className={styles.footer}>
        <Button
          type="primary"
          size="default"
          onClick={onClose}
          color="primary"
          className="mr-2"
        >
          {I18n.t('analytics_query_aigc_infopanel_cancel')}
        </Button>
        <Button
          type="primary"
          size="default"
          onClick={handleDownload}
          loading={loading}
        >
          {I18n.t('analytics_query_aigc_infopanel_download')}
        </Button>
      </div>
    </div>
  );
};
