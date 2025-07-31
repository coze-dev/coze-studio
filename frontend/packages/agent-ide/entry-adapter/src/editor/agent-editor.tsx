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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';
import { useInitStatus } from '@coze-common/chat-area';
import { useReportTti } from '@coze-arch/report-tti';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  BehaviorType,
  SpaceResourceType,
} from '@coze-arch/bot-api/playground_api';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import {
  useEditConfirm,
  useSubscribeOnboardingAndUpdateChatArea,
} from '@coze-agent-ide/space-bot/hook';
import { BotEditorServiceProvider } from '@coze-agent-ide/space-bot';
import {
  FormilyProvider,
  useGetModelList,
} from '@coze-agent-ide/model-manager';
import { BotEditorContextProvider } from '@coze-agent-ide/bot-editor-context-store';
import {
  useInitToast,
  SingleMode,
  WorkflowMode,
} from '@coze-agent-ide/bot-creator';

import { WorkflowModeToolPaneList } from '../components/workflow-mode-tool-pane-list';
import { TableMemory } from '../components/table-memory-tool';
import { SingleModeToolPaneList } from '../components/single-mode-tool-pane-list';

const BotEditor: React.FC = () => {
  const { isInit } = usePageRuntimeStore(
    useShallow(state => ({
      isInit: state.init,
      historyVisible: state.historyVisible,
      pageFrom: state.pageFrom,
    })),
  );

  const { mode, botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      mode: state.mode,
    })),
  );

  const isSingleLLM = mode === BotMode.SingleMode;
  const isSingleWorkflow = mode === BotMode.WorkflowMode;

  const spaceId = useSpaceStore(store => store.getSpaceId());

  useEditConfirm();
  useSubscribeOnboardingAndUpdateChatArea();
  useGetModelList();
  useInitToast(spaceId);
  const status = useInitStatus();

  useReportTti({
    scene: 'page-init',
    isLive: isInit,
    extra: {
      mode: 'bot-ide',
    },
  });

  /**
   * Report recently opened
   */
  useEffect(() => {
    PlaygroundApi.ReportUserBehavior({
      resource_id: botId,
      resource_type: SpaceResourceType.DraftBot,
      behavior_type: BehaviorType.Visit,
      space_id: spaceId,
    });
  }, []);

  if (status === 'unInit' || status === 'loading') {
    return null;
  }

  return (
    <>
      {isSingleLLM ? (
        <SingleMode
          renderChatTitleNode={params => <SingleModeToolPaneList {...params} />}
          memoryToolSlot={
            // table storage
            <TableMemory />
          }
        />
      ) : null}
      {isSingleWorkflow ? (
        <WorkflowMode
          renderChatTitleNode={params => (
            <WorkflowModeToolPaneList {...params} />
          )}
          memoryToolSlot={
            // table storage
            <TableMemory />
          }
        />
      ) : null}
    </>
  );
};

export const BotEditorWithContext = () => (
  <BotEditorContextProvider>
    <BotEditorServiceProvider>
      <PromptEditorProvider>
        <FormilyProvider>
          <BotEditor />
        </FormilyProvider>
      </PromptEditorProvider>
    </BotEditorServiceProvider>
  </BotEditorContextProvider>
);

export default BotEditorWithContext;
