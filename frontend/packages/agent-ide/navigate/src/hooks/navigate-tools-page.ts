import { type WorkFlowModalModeProps } from '@coze-workflow/components';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import { useCurrentNodeId } from '@coze-agent-ide/space-bot/hook';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import {
  SceneType,
  usePageJumpService,
  type WorkflowModalState,
} from '@coze-arch/bot-hooks';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { useParams } from 'react-router-dom';

export function useNavigateWorkflowEditPage(
  param?: WorkFlowModalModeProps & { newWindow?: boolean; spaceID?: string },
  scene?: SceneType,
) {
  const { jump } = usePageJumpService();
  const { space_id: spaceIDFromURL, bot_id: botIDFromURL } =
    useParams<DynamicParams>();

  const agentID = useCurrentNodeId();

  const { setWorkflowState } = useBotPageStore(state => ({
    setWorkflowState: state.setWorkflowState,
  }));

  // 为了兼容老逻辑，优先使用 url 参数，虽然看起来优先级不太对，但为了缩小影响范围这么改安全一些
  const spaceID = spaceIDFromURL ?? param?.spaceID;
  const botID = botIDFromURL ?? '';

  return (workflowID: string, workflowModalState?: WorkflowModalState) => {
    if (!workflowID || !spaceID) {
      return;
    }
    // 只有single模式下，才会设置保留workflow弹窗的keep
    if (useBotInfoStore.getState().mode === BotMode.SingleMode) {
      setWorkflowState({ showModalDefault: !!workflowModalState });
    }
    jump(scene || SceneType.BOT__VIEW__WORKFLOW, {
      workflowID,
      spaceID,
      botID,
      workflowModalState,
      agentID,
      workflowOpenMode: undefined,
      flowMode: param?.flowMode,
      newWindow: param?.newWindow,
    });
  };
}
