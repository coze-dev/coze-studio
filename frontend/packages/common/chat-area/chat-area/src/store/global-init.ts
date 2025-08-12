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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { type ChatCore } from '@coze-common/chat-core';

import { getFakeChatCore } from '../utils/fake-chat-core';

export type InitStatus = 'unInit' | 'loading' | 'initSuccess' | 'initFail';

export interface GlobalInitState {
  /** responsive */
  initStatus: InitStatus;
  chatCore: ChatCore | null;
  offChatCoreListen: () => void;
  conversationId: string | null;
}

export interface GlobalInitAction {
  setInitStatus: (status: GlobalInitState['initStatus']) => void;
  setConversationId: (id: string) => void;
  setChatCore: (chatCore: ChatCore) => void;
  setChatCoreOffListen: (offListen: () => void) => void;
  getChatCore: () => ChatCore;
  clearSideEffect: () => void;
}

export type GlobalInitStateAction = GlobalInitState & GlobalInitAction;

export const createGlobalInitStore = (mark: string) =>
  create<GlobalInitState & GlobalInitAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        initStatus: 'unInit',
        chatCore: null,
        conversationId: null,
        offChatCoreListen: () => void 0,
        setInitStatus: status => {
          set({ initStatus: status }, false, 'setInitStatus');
        },
        setConversationId: id => {
          set({ conversationId: id }, false, '');
        },
        setChatCore: (chatCore: ChatCore) => {
          set({ chatCore }, false, 'setChatCore');
        },
        setChatCoreOffListen: offListen => {
          set({ offChatCoreListen: offListen }, false, 'setChatCoreOffListen');
        },
        getChatCore: () => {
          const { chatCore } = get();
          if (!chatCore) {
            return getFakeChatCore();
          }
          return chatCore;
        },
        clearSideEffect: () => {
          get().offChatCoreListen();
          get().chatCore?.destroy();
          set(
            { initStatus: 'unInit', chatCore: null, conversationId: null },
            false,
            'clearInitStore',
          );
        },
      })),
      {
        name: `botStudio.ChatAreaInit.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type GlobalInitStore = ReturnType<typeof createGlobalInitStore>;
