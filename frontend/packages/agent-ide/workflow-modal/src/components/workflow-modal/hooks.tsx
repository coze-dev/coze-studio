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
  type WorkflowModalProps,
  type WorkflowModalState,
} from '@coze-workflow/components/workflow-modal';
import { BindBizType, WorkflowMode } from '@coze-workflow/base/api';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { usePageJumpResponse, PageType, SceneType } from '@coze-arch/bot-hooks';

import { BotWorkflowModal } from './base';

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
  if (
    jumpResponse?.scene === SceneType.WORKFLOW_PUBLISHED__BACK__BOT ||
    jumpResponse?.scene === SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT
  ) {
    return false;
  }
  if (
    (jumpResponse?.scene === SceneType.WORKFLOW__BACK__BOT ||
      jumpResponse?.scene === SceneType.WORKFLOW__BACK__DOUYIN_BOT) &&
    (jumpResponse?.flowMode || WorkflowMode.Workflow) !==
      (flowMode || WorkflowMode.Workflow)
  ) {
    return false;
  }

  return defaultVisible;
};

export const useBotWorkFlowListModal = (
  props?: Pick<
    WorkflowModalProps,
    'flowMode' | 'from' | 'bindBizId' | 'bindBizType'
  >,
): UseWorkFlowListReturnValue => {
  const { botID } = useBotInfoStore(
    useShallow(state => ({
      botID: state.botId,
    })),
  );
  const { defaultVisible, prevBotID, setWorkflowState } = useBotPageStore(
    useShallow(state => ({
      defaultVisible: state.tools.workflow.showModalDefault,
      prevBotID: state.bot.previousBotID,
      setWorkflowState: state.setWorkflowState,
    })),
  );
  const jumpResponse = usePageJumpResponse(
    props?.bindBizType === BindBizType.DouYinBot
      ? PageType.DOUYIN_BOT
      : PageType.BOT,
  );

  const [visible, setVisible] = useState(
    getInitialVisible({
      jumpResponse,
      botID,
      prevBotID,
      defaultVisible,
      flowMode: props?.flowMode,
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

  return {
    node: visible ? (
      <BotWorkflowModal
        visible
        onClose={handleClose}
        flowMode={props?.flowMode}
        initState={modalState}
        from={props?.from}
        bindBizId={props?.bindBizId}
        bindBizType={props?.bindBizType}
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
