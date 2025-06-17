import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import { type WorkflowLinkLogData } from '@/types';

import { type WorkflowLinkLog } from '../../types';

export const WorkflowLinkParser: React.FC<{
  log: WorkflowLinkLog;
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => any;
}> = ({ log, onOpenWorkflowLink }) => (
  <div className="flex items-center">
    <span className="mr-[16px] text-[14px] coz-fg-plus font-medium">
      {log.label}
    </span>
    <Typography.Text
      size="small"
      link
      onClick={() => onOpenWorkflowLink?.(log.data)}
    >
      {I18n.t('View')}
    </Typography.Text>
  </div>
);
