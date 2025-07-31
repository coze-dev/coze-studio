/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
