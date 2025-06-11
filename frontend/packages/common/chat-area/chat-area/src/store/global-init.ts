import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { type ChatCore } from '@coze-common/chat-core';

import { getFakeChatCore } from '../utils/fake-chat-core';

export type InitStatus = 'unInit' | 'loading' | 'initSuccess' | 'initFail';

export interface GlobalInitState {
  /** 响应式 */
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
