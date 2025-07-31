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

import React, { useCallback } from 'react';

// import { useShallow } from 'zustand/react/shallow';
import {
  DataSourceType,
  WorkflowModalFrom,
  type WorkflowModalProps,
  default as WorkflowModalBase,
} from '@coze-workflow/components/workflow-modal';
import { WorkflowMode } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { useNavigateWorkflowEditPage } from '@coze-agent-ide/navigate';
import { Toast, Space, Typography, Button } from '@coze-arch/coze-design';

const { Text } = Typography;

/**
 * Bot editing process selection pop-up window, with its own Bot related logic
 *
 * If you only need the process selection pop-up, use'apps/bot/src/routes/space/[space_id]/workflow/components/workflow-modal'
 */
export function BotWorkflowModal({
  flowMode = WorkflowMode.Workflow,
  from = WorkflowModalFrom.BotSkills,
  visible,
  onClose,
  initState,
  bindBizType,
  bindBizId,
}: Pick<
  WorkflowModalProps,
  | 'flowMode'
  | 'visible'
  | 'onClose'
  | 'initState'
  | 'from'
  | 'bindBizType'
  | 'bindBizId'
>) {
  const { id: spaceId } = useSpaceStore(state => state.space);
  const workflows = useBotSkillStore(s => s.workflows);
  const onNavigate2Edit = useNavigateWorkflowEditPage({
    flowMode,
  });

  const updateSkillWorkflows = useCallback(
    (newWorkflows: WorkFlowItemType[]) =>
      useBotSkillStore.getState().updateSkillWorkflows(newWorkflows),
    [flowMode],
  );

  const onItemClick: WorkflowModalProps['onItemClick'] = (val, modalStatus) => {
    if (val.type === DataSourceType.Workflow) {
      onNavigate2Edit(val.item.workflow_id || '', {
        statusStr: JSON.stringify(modalStatus),
      });
    } else {
      window.open(
        `/template/workflow/${val.item.meta_info.id}?entity_id=${ProductEntityType.WorkflowTemplateV2}`,
        '_blank',
      );
    }
  };

  const onCreateSuccess: WorkflowModalProps['onCreateSuccess'] = val => {
    onNavigate2Edit(val.workflowId);
  };

  const onAdd: WorkflowModalProps['onAdd'] = (val, config) => {
    Toast.success({
      content: (
        <Space spacing={6}>
          <Text>{I18n.t('workflow_add_list_added_success')}</Text>
          {config.isDup ? (
            <Button
              color="primary"
              onClick={() => {
                window.open(
                  `/work_flow?space_id=${spaceId}&workflow_id=${val.workflow_id}`,
                );
              }}
            >
              {I18n.t('workflowstore_continue_editing')}
            </Button>
          ) : null}
        </Space>
      ),
    });
  };

  const onRemove: WorkflowModalProps['onRemove'] = () => {
    Toast.success({
      content: I18n.t('workflow_add_list_removed_success'),
      showClose: false,
    });
  };

  return (
    <WorkflowModalBase
      from={from}
      flowMode={flowMode}
      visible={visible}
      onClose={onClose}
      initState={initState}
      workFlowList={workflows}
      bindBizId={bindBizId}
      bindBizType={bindBizType}
      onWorkFlowListChange={$newList => {
        updateSkillWorkflows($newList);
        // Automatically expand the capability module when the configuration item is adjusted
        if ($newList.length > 0) {
          emitEvent(
            flowMode === WorkflowMode.Imageflow
              ? OpenBlockEvent.IMAGEFLOW_BLOCK_OPEN
              : OpenBlockEvent.WORKFLOW_BLOCK_OPEN,
          );
        }
      }}
      onItemClick={onItemClick}
      onCreateSuccess={onCreateSuccess}
      onAdd={onAdd}
      onRemove={onRemove}
      onDupSuccess={() => null}
    />
  );
}
