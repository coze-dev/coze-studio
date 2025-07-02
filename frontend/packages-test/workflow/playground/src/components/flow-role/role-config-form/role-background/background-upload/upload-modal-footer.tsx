import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Typography } from '@coze-arch/coze-design';

import css from './upload-modal-footer.module.less';

interface UploadModalFooterProps {
  onReUpload: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const UploadModalFooter: React.FC<UploadModalFooterProps> = ({
  onReUpload,
  onSubmit,
  onCancel,
}) => (
  <div className={css['modal-footer']}>
    <div className={css['modal-left']}>
      <Button color="primary" onClick={onReUpload}>
        {I18n.t('bgi_reupload')}
      </Button>
      <Typography.Text type="secondary" size="small">
        {I18n.t('bgi_adjust_tooltip_content')}
      </Typography.Text>
    </div>
    <div className={css['modal-right']}>
      <Button color="highlight" onClick={onCancel}>
        {I18n.t('Cancel')}
      </Button>
      <Button onClick={onSubmit}>{I18n.t('Confirm')}</Button>
    </div>
  </div>
);
