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

  // In order to be compatible with the old logic, the URL parameter is preferred
  const spaceID = spaceIDFromURL ?? param?.spaceID;
  const botID = botIDFromURL ?? '';

  return (workflowID: string, workflowModalState?: WorkflowModalState) => {
    if (!workflowID || !spaceID) {
      return;
    }
    // Only in single mode will the keep workflow pop-up be set
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
