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

import React, { Suspense, lazy, useMemo } from 'react';

import { userStoreService } from '@coze-studio/user-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozIllusAdd } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';
import { CreateEnv } from '@coze-arch/bot-api/workflow_api';
import type { IProject } from '@coze-studio/open-chat';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

import { DISABLED_CONVERSATION } from '../constants';
import { useSkeleton } from './use-skeleton';

const LazyBuilderChat = lazy(async () => {
  const { BuilderChat } = await import('@coze-studio/open-chat');
  return { default: BuilderChat };
});

export interface ChatHistoryProps {
  /**
   * session id
   */
  conversationId?: string;
  /**
   * session name
   */
  conversationName: string;
  /**
   * Channel ID
   */
  connectorId: string;
  /**
   * Create a conversation environment
   */
  createEnv: CreateEnv;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversationId,
  conversationName,
  connectorId,
  createEnv,
}) => {
  const userInfo = userStoreService.getUserInfo();
  const renderLoading = useSkeleton();

  const projectInfo = useIDEGlobalStore(
    store => store.projectInfo?.projectInfo,
  );

  const innerProjectInfo = useMemo<IProject>(
    () => ({
      id: projectInfo?.id || '',
      conversationId,
      connectorId,
      conversationName,
      name: conversationName || projectInfo?.name,
      iconUrl: projectInfo?.icon_url,
      type: 'app',
      mode: createEnv === CreateEnv.Draft ? 'draft' : 'release',
      caller: createEnv === CreateEnv.Draft ? 'CANVAS' : undefined,
    }),
    [projectInfo, conversationId, connectorId, conversationName, createEnv],
  );

  const chatUserInfo = {
    id: userInfo?.user_id_str || '',
    name: userInfo?.name || '',
    avatar: userInfo?.avatar_url || '',
  };

  if (
    !innerProjectInfo.id ||
    !conversationName ||
    (conversationId === DISABLED_CONVERSATION && createEnv !== CreateEnv.Draft)
  ) {
    return (
      <EmptyState
        size="full_screen"
        icon={<IconCozIllusAdd />}
        title={I18n.t('wf_chatflow_61')}
        description={I18n.t('wf_chatflow_62')}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <LazyBuilderChat
        workflow={{}}
        project={innerProjectInfo}
        areaUi={{
          // Only look at the session record, not operate
          isDisabled: true,
          isNeedClearContext: false,
          input: {
            isShow: false,
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
