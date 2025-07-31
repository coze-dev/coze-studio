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

import { useCallback } from 'react';

import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozAutoLayout } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { useEntity, usePlayground } from '@flowgram-adapter/free-layout-editor';

import { useAutoLayout } from '../hooks';
import { WorkflowGlobalStateEntity } from '../../../entities';

export const AutoLayout = () => {
  const runAutoLayout = useAutoLayout();
  const playground = usePlayground();
  const workflowState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );
  const { workflowId } = workflowState;
  const autoLayout = useCallback(async () => {
    await runAutoLayout();
    reporter.event({
      eventName: 'workflow_control_auto_layout',
      namespace: 'workflow',
      scope: 'control', // Secondary namespace to refine specific scenarios
      meta: {
        workflowId,
      }, // For other custom information, try to avoid reporting irrelevant or redundant information
    });
  }, [runAutoLayout, workflowId]);

  if (playground.config.readonly) {
    return <></>;
  }

  return (
    <Tooltip content={I18n.t('workflow_detail_layout_optimization_tooltip')}>
      <IconButton
        onClick={autoLayout}
        icon={<IconCozAutoLayout className="coz-fg-primary" />}
        color="secondary"
        data-testid="workflow.detail.toolbar.auto-layout"
      />
    </Tooltip>
  );
};
