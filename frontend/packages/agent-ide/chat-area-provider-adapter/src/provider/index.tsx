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

import { useEffect, type PropsWithChildren } from 'react';

import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useEventCallback } from '@coze-common/chat-hooks';
import { Scene } from '@coze-common/chat-core';
import { ResumePluginRegistry } from '@coze-common/chat-area-plugin-resume';
import { ReasoningPluginRegistry } from '@coze-common/chat-area-plugin-reasoning';
import { useCreateGrabPlugin } from '@coze-common/chat-area-plugin-message-grab';
import { type MixInitResponse, type SenderInfo } from '@coze-common/chat-area';
import { useMessageReportEvent } from '@coze-arch/bot-hooks';
import {
  type GetMessageListRequest,
  Scene as SceneFromIDL,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import {
  BotDebugChatAreaProvider as BaseProvider,
  type BotDebugChatAreaProviderProps,
  useBotEditorChatBackground,
} from '@coze-agent-ide/chat-area-provider';
import { getDebugCommonPluginRegistry } from '@coze-agent-ide/chat-area-plugin-debug-common';

export interface BotDebugChatAreaProviderAdapterProps
  extends Pick<BotDebugChatAreaProviderProps, 'botId'> {
  userId: string | undefined;
}

export const BotDebugChatAreaProviderAdapter: React.FC<
  PropsWithChildren<BotDebugChatAreaProviderAdapterProps>
> = ({ children, botId, userId }) => {
  const DebugCommonPlugin = getDebugCommonPluginRegistry({
    scene: Scene.Playground,
    botId,
    methods: {
      refreshTaskList: () => 0,
    },
  });

  const setPageRuntimeBotInfo = usePageRuntimeStore(
    state => state.setPageRuntimeBotInfo,
  );

  const { grabEnableUpload, GrabPlugin, grabPluginId } = useCreateGrabPlugin();

  const { ChatBackgroundPlugin, showBackground } = useBotEditorChatBackground();

  useEffect(() => {
    if (grabPluginId) {
      setPageRuntimeBotInfo({ grabPluginId });
    }
  }, [grabPluginId]);

  useMessageReportEvent();

  const getMessageList = (params: GetMessageListRequest) =>
    DeveloperApi.GetMessageList(params);

  const requestToInit = useEventCallback(async (): Promise<MixInitResponse> => {
    const { onboardingContent, backgroundImageInfoList } =
      useBotSkillStore.getState();
    const { prologue } = onboardingContent;

    const botInfo = useBotInfoStore.getState();
    const { name, icon_url } = botInfo ?? {};
    const params: GetMessageListRequest = {
      bot_id: botId,
      cursor: '0',
      count: 15,
      draft_mode: true,
      scene: SceneFromIDL.Playground,
    };
    const dratMain = await getMessageList(params);

    return {
      conversationId: dratMain.conversation_id,
      cursor: dratMain.cursor,
      hasMore: dratMain.hasmore,
      messageList: dratMain.message_list,
      lastSectionId: dratMain.last_section_id,
      prologue,
      botInfoMap: {
        [botId]: {
          nickname: name ?? '',
          url: icon_url ?? '',
          id: botId,
          allowMention: false,
        } satisfies SenderInfo,
      },
      backgroundInfo: backgroundImageInfoList[0],
      next_cursor: dratMain.next_cursor,
    };
  });

  const pluginRegistryList = [
    DebugCommonPlugin,
    ResumePluginRegistry,
    GrabPlugin,
    ChatBackgroundPlugin,
    ReasoningPluginRegistry,
  ];
  if (!userId) {
    return null;
  }
  return (
    <BaseProvider
      requestToInit={requestToInit}
      botId={botId}
      pluginRegistryList={pluginRegistryList}
      showBackground={showBackground}
      grabEnableUpload={grabEnableUpload}
    >
      {children}
    </BaseProvider>
  );
};
