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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, useState, useMemo, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  DataSourceType,
  WorkflowModalFrom,
  type WorkflowModalProps,
  type WorkflowModalState,
  default as WorkflowModalBase,
} from '@coze-workflow/components/workflow-modal';
import { WorkflowMode } from '@coze-workflow/base/api';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { usePageJumpResponse, PageType, SceneType } from '@coze-arch/bot-hooks';
import { useNavigateWorkflowEditPage } from '@coze-agent-ide/navigate';
import { Toast, Space, Typography, Button } from '@coze-arch/coze-design';
const { Text } = Typography;

export interface UseWorkFlowListReturnValue {
  node: ReactNode;
  open: () => void;
  close: () => void;
}

const getInitialVisible = ({
  jumpResponse,
  botID,
  prevBotID,
  defaultVisible,
  flowMode,
}: Record<string, any>) => {
  if (botID !== prevBotID) {
    return false;
  }
  if (jumpResponse?.scene === SceneType.WORKFLOW_PUBLISHED__BACK__BOT) {
    return false;
  }
  if (
    jumpResponse?.scene === SceneType.WORKFLOW__BACK__BOT &&
    (jumpResponse?.flowMode || WorkflowMode.Workflow) !==
      (flowMode || WorkflowMode.Workflow)
  ) {
    return false;
  }

  return defaultVisible;
};

export const useBotWorkFlowListModal = ({
  flowMode = WorkflowMode.Workflow,
  workflow,
  setWorkflow,
}: {
  flowMode: WorkflowMode;
  workflow?: WorkFlowItemType;
  setWorkflow: (value: WorkFlowItemType) => void;
}): UseWorkFlowListReturnValue => {
  const { botID } = useBotInfoStore(
    useShallow(state => ({
      botID: state.botId,
    })),
  );

  const { id: spaceId } = useSpaceStore(state => state.space);

  const workflows = workflow ? [workflow] : [];

  const onNavigate2Edit = useNavigateWorkflowEditPage({
    flowMode,
  });

  const { defaultVisible, prevBotID, setWorkflowState } = useBotPageStore(
    useShallow(state => ({
      defaultVisible: state.tools.workflow.showModalDefault,
      prevBotID: state.bot.previousBotID,
      setWorkflowState: state.setWorkflowState,
    })),
  );
  const jumpResponse = usePageJumpResponse(PageType.BOT);

  const [visible, setVisible] = useState(
    getInitialVisible({
      jumpResponse,
      botID,
      prevBotID,
      defaultVisible,
      flowMode,
    }),
  );

  const modalState = useMemo(() => {
    // Get the initial value in the default open state
    if (!jumpResponse || !defaultVisible) {
      return;
    }
    return safeParse<WorkflowModalState>(
      (jumpResponse as any).workflowModalState?.statusStr || '',
    );
  }, [jumpResponse, defaultVisible]);

  useEffect(() => {
    if (visible) {
      setWorkflowState({ showModalDefault: false });
    }
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const onItemClick: WorkflowModalProps['onItemClick'] = (val, modalStatus) => {
    if (val.type === DataSourceType.Workflow) {
      onNavigate2Edit(val.item.workflow_id || '', {
        statusStr: JSON.stringify(modalStatus),
      });
    } else {
      window.open(
        `/store/workflow/${val.item.meta_info.entity_id}?workflow_id=true`,
        '_blank',
      );
    }
  };

  const onCreateSuccess: WorkflowModalProps['onCreateSuccess'] = val => {
    onNavigate2Edit(val.workflowId);
  };

  const onAdd: WorkflowModalProps['onAdd'] = (val, config) => {
    handleClose();

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

  const onClose = () => {
    setVisible(false);
  };

  return {
    node: visible ? (
      <WorkflowModalBase
        from={WorkflowModalFrom.WorkflowAgent}
        flowMode={flowMode}
        visible={visible}
        onClose={onClose}
        initState={{ ...modalState, listFlowMode: flowMode }}
        hiddenListFlowModeFilter={true}
        workFlowList={workflows}
        onWorkFlowListChange={$newList => {
          setWorkflow($newList[0]);
        }}
        onItemClick={onItemClick}
        onCreateSuccess={onCreateSuccess}
        onAdd={onAdd}
        onRemove={onRemove}
        onDupSuccess={() => null}
      />
    ) : null,
    close: handleClose,
    open: handleOpen,
  };
};

function safeParse<T>(jsonString: string): T | undefined {
  try {
    // Attempt to parse JSON strings
    return JSON.parse(jsonString);
    // eslint-disable-next-line @coze-arch/use-error-in-catch
  } catch (error) {
    // If there is an error during parsing, return null.
    return undefined;
  }
}
