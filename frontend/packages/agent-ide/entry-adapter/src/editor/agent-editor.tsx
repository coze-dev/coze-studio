import { useShallow } from 'zustand/react/shallow';
import {
  useEditConfirm,
  useSubscribeOnboardingAndUpdateChatArea,
} from '@coze-agent-ide/space-bot/hook';
import { BotEditorServiceProvider } from '@coze-agent-ide/space-bot';
import { useReportTti } from '@coze-arch/report-tti';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';
import { useInitStatus } from '@coze-common/chat-area';
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

  const { mode } = useBotInfoStore(
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
