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

/* eslint-disable max-lines-per-function */
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { produce } from 'immer';
import { type Conversation, type CozeAPI } from '@coze/api';
import { type ShortCutCommand } from '@coze-common/chat-area-plugins-chat-shortcuts';
import { type MixInitResponse } from '@coze-common/chat-area';

import { type SDKInitError } from '@/util/error';
import { getStorageKey, LocalStorageKey, storageUtil } from '@/util';
import { type OpenUserInfo } from '@/types/user';
import { EInputMode, type CozeChatConfig } from '@/types/props';
import { AuthType } from '@/types/client';

type ErrorState = boolean | SDKInitError;
/** store 相关 */
export interface ChatState {
  userInfo?: OpenUserInfo;
  token?: string;
  isNeedToken?: boolean;
  isNeedStopRespond?: boolean;
  initError?: ErrorState;
  voiceCallClose?: boolean;
  defaultInputMode?: EInputMode;
  isStartBotVoiceCall?: boolean;
  backgroundInfo: MixInitResponse['backgroundInfo'];
  feedbackInfo: {
    [itemId: string]: 'thumbUp' | 'thumbDown' | 'default';
  };
  lastGroupFeedbackInfo: {
    messageId?: string;
    isShowCustomPanel: boolean;
  };
  shortcuts: ShortCutCommand[];
  /**
   * @description 用来表示被选中的当前会话 id 、上下文的 id 和是否显示会话列表
   */
  currentConversationInfo?: Conversation & {
    conversationListVisible: boolean;
    isLargeWidth: boolean;
  };
  conversations: Conversation[];
  cozeApi?: CozeAPI;
  hasRefusedCallByUser?: boolean;
}

export interface ChatAction {
  setUserId: (userId: string) => void;
  setToken: (token: string) => void;
  refreshToken: () => Promise<string>;
  setUserInfo: (userInfo: OpenUserInfo) => void;
  setInitError: (error: ErrorState) => void;
  setDefaultInputMode: (defaultInputMode: EInputMode) => void;
  setVoiceCallClose: (voiceCallClose: boolean) => void;
  setIsStartBotVoiceCall: (isStartBotVoiceCall?: boolean) => void;
  setHasRefusedCallByUser: (hasRefusedCallByUser: boolean) => void;
  updateFeedbackInfo: (
    itemId: string,
    feedbackType: 'thumbUp' | 'thumbDown' | 'default',
  ) => void;
  updateLastGroupFeedbackInfo: (
    messageId: string,
    isShowCustomPanel: boolean,
  ) => void;
  updateShortcuts: (shortcuts: ShortCutCommand[]) => void;
  updateBackgroundInfo: (info: MixInitResponse['backgroundInfo']) => void;
  /**
   * @description 这里只是为给发送消息那里一个方法，用户根据第一条 query 来更新会话名称
   * @param currentConversationInfo 当配置了 isNeedConversationAdd 后的当前会话会话信息，包括会话列表是否展开
   */
  updateCurrentConversationInfo: (
    currentConversationInfo: ChatState['currentConversationInfo'],
  ) => void;
  /**
   * @description 这里只是为给发送消息那里一个方法，用户根据第一条 query 来更新会话名称
   * @param name 会话名称
   */
  updateCurrentConversationNameByMessage: (name: string) => Promise<boolean>;
  updateConversations: (
    conversations: Conversation[],
    operate: 'replace' | 'add' | 'remove' | 'update',
  ) => void;
  setCozeApi: (cozeApi: CozeAPI) => void;
}
export type ChatStateAction = ChatState & ChatAction;

const getDefaultUserInfo = (userInfo?: OpenUserInfo) => {
  if (userInfo?.id) {
    return userInfo;
  }
  const userIdKey = getStorageKey(LocalStorageKey.UID);
  return {
    id: storageUtil.getItem(userIdKey, '') || nanoid(),
    nickname: '',
    url: '',
  };
};

export const createChatStore = (
  chatConfig: CozeChatConfig,
  userInfo?: OpenUserInfo,
) => {
  const isNeedToken = chatConfig?.auth?.type === AuthType.TOKEN;
  const token = isNeedToken ? chatConfig?.auth?.token : '';
  return create<ChatStateAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        userInfo: getDefaultUserInfo(userInfo),
        token,
        isNeedToken,
        voiceCallClose: true,
        isStartBotVoiceCall: false,
        isNeedStopRespond: true,
        initError: false,
        voiceInfoList: [],
        lastGroupFeedbackInfo: {
          cozeApiMessageId: '',
          isShowCustomPanel: false,
        },
        backgroundInfo: {},
        shortcuts: [],
        defaultInputMode: EInputMode.Text,
        feedbackInfo: {},
        currentConversationInfo: undefined,
        conversations: [],
        cozeApi: undefined,
        hasRefusedCallByUser: false,
        setHasRefusedCallByUser: (hasRefusedCallByUser: boolean) => {
          set(
            produce<ChatStateAction>(s => {
              s.hasRefusedCallByUser = hasRefusedCallByUser;
            }),
          );
        },
        refreshToken: async () => {
          const tokenOld = get().token || '';
          const newToken = await chatConfig?.auth?.onRefreshToken?.(tokenOld);
          if (newToken) {
            set(
              produce<ChatStateAction>(s => {
                s.token = newToken;
              }),
            );
          }
          return newToken || '';
        },
        setUserInfo: userInfoIn => {
          set(
            produce<ChatStateAction>(s => {
              s.userInfo = getDefaultUserInfo(userInfoIn);
            }),
          );
        },
        setUserId: (userId: string) => {
          set(
            produce<ChatStateAction>(s => {
              s.userInfo = {
                id: userId,
                nickname: '',
                url: '',
              };
            }),
          );
        },
        setToken: (tokenNew: string) => {
          set(
            produce<ChatStateAction>(s => {
              s.token = tokenNew;
            }),
          );
        },
        setInitError: (error: ErrorState) => {
          const { initError } = get();
          if (error && initError && typeof initError !== 'boolean') {
            return;
          }
          set(
            produce<ChatStateAction>(s => {
              s.initError = error;
            }),
          );
        },
        setDefaultInputMode: (defaultInputMode: EInputMode) => {
          set(
            produce<ChatStateAction>(s => {
              s.defaultInputMode = defaultInputMode;
            }),
          );
        },
        updateLastGroupFeedbackInfo: (
          messageId: string,
          isShowCustomPanel: boolean,
        ) => {
          set(
            produce<ChatStateAction>(s => {
              s.lastGroupFeedbackInfo = {
                messageId,
                isShowCustomPanel,
              };
            }),
          );
        },
        updateFeedbackInfo: (
          itemId: string,
          feedbackType: 'thumbUp' | 'thumbDown' | 'default',
        ) => {
          set(
            produce<ChatStateAction>(s => {
              s.feedbackInfo[itemId] = feedbackType;
            }),
          );
        },
        updateShortcuts(shortcuts: ShortCutCommand[]) {
          set(
            produce<ChatStateAction>(s => {
              s.shortcuts = shortcuts;
            }),
          );
        },
        updateBackgroundInfo(info: MixInitResponse['backgroundInfo']) {
          set(
            produce<ChatStateAction>(s => {
              s.backgroundInfo = info;
            }),
          );
        },
        setVoiceCallClose(voiceCallClose: boolean) {
          set(
            produce<ChatStateAction>(s => {
              s.voiceCallClose = voiceCallClose;
            }),
          );
        },
        setIsStartBotVoiceCall(isStartBotVoiceCall?: boolean) {
          set(
            produce<ChatStateAction>(s => {
              s.isStartBotVoiceCall = isStartBotVoiceCall;
            }),
          );
        },
        updateCurrentConversationInfo: currentConversationInfo => {
          set(
            produce<ChatStateAction>(s => {
              if (!currentConversationInfo) {
                s.currentConversationInfo = currentConversationInfo;
              } else {
                s.currentConversationInfo = {
                  ...s.currentConversationInfo,
                  ...currentConversationInfo,
                };
              }
            }),
          );
        },
        updateCurrentConversationNameByMessage: async (name: string) => {
          const {
            currentConversationInfo,
            updateCurrentConversationInfo,
            updateConversations,
            cozeApi,
          } = get();
          if (!currentConversationInfo || currentConversationInfo.name) {
            return Promise.resolve(false);
          }
          try {
            const res = (await cozeApi?.put(
              `/v1/conversations/${currentConversationInfo.id}`,
              {
                name,
              },
            )) as {
              data: Conversation;
              code: number;
            };
            if (res.code !== 0) {
              return Promise.resolve(false);
            }
            updateCurrentConversationInfo({
              ...currentConversationInfo,
              name,
            });
            await updateConversations([res.data], 'update');
            return true;
          } catch (error) {
            console.error(error);
            return Promise.resolve(false);
          }
        },
        updateConversations: (conversations, operate) => {
          set(
            produce<ChatStateAction>(s => {
              if (operate === 'replace') {
                s.conversations = conversations;
              } else if (operate === 'add') {
                s.conversations = [...s.conversations, ...conversations];
              } else if (operate === 'remove') {
                conversations.forEach(conversation => {
                  const index = s.conversations.findIndex(
                    c => c.id === conversation.id,
                  );
                  if (index !== -1) {
                    s.conversations.splice(index, 1);
                  }
                });
              } else if (operate === 'update') {
                conversations.forEach(conversation => {
                  const index = s.conversations.findIndex(
                    c => c.id === conversation.id,
                  );
                  if (index !== -1) {
                    s.conversations[index] = {
                      ...s.conversations[index],
                      ...conversation,
                    };
                  }
                });
              }
            }),
          );
        },
        setCozeApi: (cozeApi: CozeAPI) => {
          set(
            produce<ChatStateAction>(s => {
              s.cozeApi = cozeApi;
            }),
          );
        },
      })),
      {
        enabled: IS_DEV_MODE,
        name: 'CozeChatApp.global',
      },
    ),
  );
};

export type ChatStore = ReturnType<typeof createChatStore>;
