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
import { isEqual, merge } from 'lodash-es';
import { produce } from 'immer';

import {
  type SenderInfo,
  type SenderInfoMap,
  type UserInfoMap,
  type UserSenderInfo,
} from './types';

interface SenderInfoState {
  botInfoMap: SenderInfoMap;
  userInfoMap: UserInfoMap;
  userInfo: UserSenderInfo | null;
  /**
   * Currently only cozing homes are in use
   */
  waitingSenderId: string | null;
}

export type WaitingSenderId = string | null;

export type BotInfoUpdate = (
  updater: (currentBotInfoMap: SenderInfoMap) => SenderInfoMap,
) => void;

export type UpdateBotInfoByImmer = (
  updater: (botInfo: SenderInfoMap) => void,
) => void;

interface SenderInfoAction {
  updateBotInfo: BotInfoUpdate;
  setBotInfoMap: (botInfoMap: SenderInfoMap) => void;
  setSenderInfoBatch: (botInfoList: SenderInfo[]) => void;
  updateBotInfoByImmer: UpdateBotInfoByImmer;
  updateUserInfo: (senderInfo: UserSenderInfo | null) => void;
  updateWaitingSenderId: (id: WaitingSenderId) => void;
  getMessageUserInfo: (userId?: string) => UserSenderInfo | null;
  setUserInfoMap: (userInfoMap: UserInfoMap) => void;
  /**
   * Get image information
   * @param senderId
   * @Param role Please do not use this parameter, it will be offline in the near future
   * @returns AvatarInfo | undefined
   */
  getBotInfo: (senderId?: string) => SenderInfo | undefined;
  clearSenderInfoStore: () => void;
}

const getDefaultState = (): SenderInfoState => ({
  botInfoMap: {},
  userInfoMap: {},
  userInfo: null,
  waitingSenderId: null,
});

export const createSenderInfoStore = (mark: string) => {
  const useSenderInfoStore = create<SenderInfoState & SenderInfoAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        ...getDefaultState(),
        updateWaitingSenderId: id =>
          set({ waitingSenderId: id }, false, 'updateWaitingSenderId'),
        updateBotInfo: updater => {
          set(
            {
              botInfoMap: updater(get().botInfoMap),
            },
            false,
            'botInfoMap',
          );
        },
        setSenderInfoBatch: infoList => {
          const changedBotInfoMap: SenderInfoMap = {};
          const { botInfoMap } = get();
          for (const newItem of infoList) {
            const { id } = newItem;
            const curItem = botInfoMap[id];
            if (!isEqual(curItem, newItem)) {
              changedBotInfoMap[id] = newItem;
            }
          }
          if (!Object.keys(changedBotInfoMap).length) {
            return;
          }
          set(
            produce<SenderInfoState>(state => {
              merge(state.botInfoMap, changedBotInfoMap);
            }),
            false,
            'setSenderInfoBatch',
          );
        },
        updateBotInfoByImmer: updater => {
          set(
            produce<SenderInfoState>(state => updater(state.botInfoMap)),
            false,
            'updateBotInfoByImmer',
          );
        },
        setUserInfoMap: userInfoMap => {
          set({ userInfoMap }, false, 'setUserInfoMap');
        },
        setBotInfoMap: botInfoMap => {
          set({ botInfoMap }, false, 'setBotInfo');
        },
        updateUserInfo: senderInfo => {
          set(
            {
              userInfo: senderInfo,
            },
            false,
            'updateUserInfo',
          );
        },
        /**
         * @param userId => message.sender_id
         */
        getMessageUserInfo: userId => {
          const { userInfoMap, userInfo } = get();

          if (!userId) {
            return userInfo;
          }

          return userInfoMap[userId] || userInfo || null;
        },
        getBotInfo: senderId => {
          const { botInfoMap } = get();
          if (!senderId) {
            return;
          }

          const botInfo = botInfoMap[senderId];

          return botInfo;
        },
        clearSenderInfoStore: () => {
          set(getDefaultState(), false, 'clearSenderInfoStore');
        },
      })),
      {
        name: `botStudio.ChatAreaSenderInfoStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );
  return useSenderInfoStore;
};

export type SenderInfoStore = ReturnType<typeof createSenderInfoStore>;
