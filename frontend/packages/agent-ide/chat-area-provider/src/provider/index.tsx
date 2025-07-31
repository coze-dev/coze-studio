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

import { type PropsWithChildren } from 'react';

import { Scene } from '@coze-common/chat-core';
import {
  type MixInitResponse,
  ChatAreaProvider,
  type PluginRegistryEntry,
} from '@coze-common/chat-area';
import { reporter } from '@coze-arch/logger';
// import { CreateRoomScene } from '@coze-arch/idl';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useUserSenderInfo, useMessageReportEvent } from '@coze-arch/bot-hooks';
export interface BotDebugChatAreaProviderProps {
  botId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- biz context type
  pluginRegistryList?: PluginRegistryEntry<any>[];
  onInitRequestSuccess?: (params: { conversationId: string }) => void;
  requestToInit: () => Promise<MixInitResponse>;
  showBackground: boolean;
  grabEnableUpload: boolean;
}

export const BotDebugChatAreaProvider: React.FC<
  PropsWithChildren<BotDebugChatAreaProviderProps>
> = ({
  children,
  botId,
  pluginRegistryList,
  requestToInit,
  showBackground,
  grabEnableUpload,
}) => {
  useMessageReportEvent();
  const userSenderInfo = useUserSenderInfo();

  return (
    <ChatAreaProvider
      spaceId={useSpaceStore.getState().getSpaceId()}
      botId={botId}
      scene={Scene.Playground}
      userInfo={userSenderInfo}
      requestToInit={requestToInit}
      reporter={reporter}
      enableChatActionLock
      enableChatCoreDebug
      pluginRegistryList={pluginRegistryList}
      enableImageAutoSize={true}
      enablePasteUpload={grabEnableUpload}
      enableDragUpload={grabEnableUpload}
      uikitChatInputButtonStatus={{
        isMoreButtonDisabled: !grabEnableUpload,
      }}
      showBackground={showBackground}
    >
      {children}
    </ChatAreaProvider>
  );
};
