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

import React, { Suspense, lazy } from 'react';

import { isEmpty } from 'lodash-es';
import { userStoreService } from '@coze-studio/user-store';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozIllusAdd } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';
import {
  type ProjectConversation,
  CreateEnv,
} from '@coze-arch/bot-api/workflow_api';
import { type IWorkflow, type IProject } from '@coze-studio/open-chat';

import { useSkeleton } from './use-skeleton';

const LazyBuilderChat = lazy(async () => {
  const { BuilderChat } = await import('@coze-studio/open-chat');
  return { default: BuilderChat };
});
export interface ProjectOrBotInfoType {
  id: string;
  iconUrl: string;
  name: string;
  type: IntelligenceType;
}

export interface ChatHistoryProps {
  workflowInfo?: IWorkflow;
  showInputArea?: boolean;
  projectOrBotInfo?: ProjectOrBotInfoType;
  activateChat?: ProjectConversation;
  type: CreateEnv;
  defaultText?: string;
  topSlot?: (isChatError?: boolean) => React.ReactNode;
  onGetChatFlowExecuteId?: (executeId: string) => void;
}

/** Backend @qiangshunliang definition, display empty state when no dialogue exists */
const DISABLED_CONVERSATION = '0';

// eslint-disable-next-line complexity
export const ChatHistory = ({
  workflowInfo = {},
  projectOrBotInfo,
  activateChat,
  type,
  // Default does not show dialog box
  showInputArea = false,
  onGetChatFlowExecuteId,
  defaultText = '',
  topSlot,
}: ChatHistoryProps) => {
  const userInfo = userStoreService.getUserInfo();
  const renderLoading = useSkeleton();

  const chatUserInfo = {
    id: userInfo?.user_id_str || '',
    name: userInfo?.name || '',
    avatar: userInfo?.avatar_url || '',
  };

  if (
    !projectOrBotInfo?.id ||
    !activateChat?.conversation_name ||
    (activateChat?.conversation_id === DISABLED_CONVERSATION &&
      isEmpty(workflowInfo))
  ) {
    // Workflow scenes do not show empty states
    if (!isEmpty(workflowInfo)) {
      return null;
    }
    return (
      <EmptyState
        size="full_screen"
        icon={<IconCozIllusAdd />}
        title={I18n.t('wf_chatflow_61')}
        description={I18n.t('wf_chatflow_62')}
      />
    );
  }
  const conversationName =
    type === CreateEnv.Draft
      ? activateChat?.conversation_name || ''
      : activateChat?.release_conversation_name ||
        activateChat?.conversation_name ||
        '';
  const projectInfo: IProject = {
    id: projectOrBotInfo?.id,
    conversationName,
    defaultName: activateChat?.conversation_name || projectOrBotInfo?.name,
    defaultIconUrl: projectOrBotInfo?.iconUrl,
    connectorId: type === CreateEnv.Draft ? '10000010' : '1024',
    type: projectOrBotInfo?.type === IntelligenceType.Project ? 'app' : 'bot',
    mode: type === CreateEnv.Draft ? 'draft' : 'release',
    conversationId: activateChat?.conversation_id,
    caller: type === CreateEnv.Draft ? 'CANVAS' : undefined,
  };

  return (
    <Suspense fallback={null}>
      <LazyBuilderChat
        workflow={workflowInfo}
        project={projectInfo}
        eventCallbacks={{
          onGetChatFlowExecuteId,
        }}
        areaUi={{
          isNeedClearContext: false,
          input: {
            isShow: showInputArea,
            defaultText,
            renderChatInputTopSlot: topSlot,
          },
          renderLoading,
          uiTheme: 'chatFlow',
        }}
        userInfo={chatUserInfo}
        auth={{
          type: 'internal',
        }}
      ></LazyBuilderChat>
    </Suspense>
  );
};
