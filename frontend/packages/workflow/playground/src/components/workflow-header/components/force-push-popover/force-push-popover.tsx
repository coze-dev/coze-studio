import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Popover, Typography } from '@coze/coze-design';

import styles from './force-push-popover.module.less';

interface ForcePushPopoverContentProps {
  title?: string;
  description?: string;
  mainButtonText?: string;
  onOpenTestRun: () => void;
  onForcePush: () => void;
  onCancel: () => void;
}

const ForcePushPopoverContent: React.FC<ForcePushPopoverContentProps> = ({
  title,
  description,
  mainButtonText,
  onOpenTestRun,
  onForcePush,
  onCancel,
}) => (
  <div className={styles['popover-content']}>
    <Typography.Text strong>{title}</Typography.Text>
    <br />
    <Typography.Text type="secondary" size="small">
      {description}
    </Typography.Text>
    <div className={styles['popover-btns']}>
      <Button size="small" color="hgltplus" onClick={onOpenTestRun}>
        {I18n.t('workflow_detail_title_testrun')}
      </Button>
      <Button size="small" color="primary" onClick={onForcePush}>
        {mainButtonText}
      </Button>
      <Button size="small" color="primary" onClick={onCancel}>
        {I18n.t('workflow_list_create_modal_footer_cancel')}
      </Button>
    </div>
  </div>
);

interface ForcePushPopoverProps {
  visible: boolean;
  title?: string;
  description?: string;
  mainButtonText?: string;
  onOpenTestRun: () => void;
  onForcePush: () => void;
  onCancel: () => void;
}

export const ForcePushPopover: React.FC<
  React.PropsWithChildren<ForcePushPopoverProps>
> = ({ visible, children, ...props }) => (
  <Popover
    visible={visible}
    trigger="custom"
    position="bottomRight"
    content={<ForcePushPopoverContent {...props} />}
  >
    {children}
  </Popover>
);
