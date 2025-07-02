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
   * 上报最近打开
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
            // 表格存储
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
            // 表格存储
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
