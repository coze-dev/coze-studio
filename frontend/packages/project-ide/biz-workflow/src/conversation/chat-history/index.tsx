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
   * 会话 id
   */
  conversationId?: string;
  /**
   * 会话名称
   */
  conversationName: string;
  /**
   * 渠道 id
   */
  connectorId: string;
  /**
   * 创建会话的环境
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
          // 只看会话记录，不可操作
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
