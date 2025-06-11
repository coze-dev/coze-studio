import React from 'react';

import { IconCozChat, IconCozWorkflow } from '@coze/coze-design/icons';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
export const WORKFLOW_SUB_TYPE_ICON_MAP = {
  [WorkflowMode.Workflow]: <IconCozWorkflow />,
  [WorkflowMode.ChatFlow]: <IconCozChat />,
};
