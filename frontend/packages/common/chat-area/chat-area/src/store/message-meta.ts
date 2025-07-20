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
 
import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

import { findMessageById } from '../utils/message';
import { type ChatAreaConfigs } from '../context/chat-area-context/type';
import { type MessageMeta } from './types';
import { type SectionIdStore } from './section-id';
import { type MessagesStore } from './messages';
import { updateMetaListDivider } from './helpers/split-section';
import { mutateUpdateMetaByGroupInfo } from './helpers/mutate-meta-by-groups';
import { scanAndUpdateHideAvatar } from './helpers/hide-avatar';
import { getInitMetaByMessage } from './helpers/get-meta-by-message';
import { addJumpVerboseInfo } from './helpers/add-verbose-info';
import { addAnswerLocation } from './helpers/add-answer-location';

export type MessageMetaStoreStateAction = MessageMetaState & MessageMetaAction;

export interface MessageMetaState {
  metaList: MessageMeta[];
}

export interface MessageMetaAction {
  getMetaByMessage: (id: string) => MessageMeta;
  updateMeta: (metaList: MessageMeta[]) => void;
  updateMetaByImmer: (updater: (metaList: MessageMeta[]) => void) => void;
  clear: () => void;
}

export const createMessageMetaStore = (mark: string) => {
  const useMessageMetaStore = createWithEqualityFn<
    MessageMetaState & MessageMetaAction
  >()(
    devtools(
      subscribeWithSelector((set, get) => ({
        metaList: [],
        getMetaByMessage: id => {
          const meta = findMessageById(get().metaList, id);
          if (!meta) {
            throw new Error(`fail to find meta of ${id}`);
          }
          return meta;
        },
        updateMeta: metaList => {
          set(
            {
              metaList,
            },
            false,
            'updateMeta',
          );
        },
        updateMetaByImmer: updater => {
          set(
            produce<MessageMetaState>(state => updater(state.metaList)),
            false,
            'updateMetaByImmer',
          );
        },
        clear: () => {
          set({ metaList: [] }, false, 'clear');
        },
      })),
      {
        name: `botStudio.ChatAreaMessageMeta.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useMessageMetaStore;
};

export type MessageMetaStore = ReturnType<typeof createMessageMetaStore>;

/**
 * 基于 messages 变化自动重新生成 meta list；
 * 这一层不做优化处理，在组件内消费 meta 时进行深度比对；
 * 将来看一下是否需要进一步优化；
 * 这上下两处订阅对于数据的处理方式有微妙的差异 可变vs不可变，希望你注意到
 */
export const subscribeMessageToUpdateMeta = (
  store: {
    useMessagesStore: MessagesStore;
    useMessageMetaStore: MessageMetaStore;
    useSectionIdStore: SectionIdStore;
  },
  configs: ChatAreaConfigs,
) => {
  const { useMessagesStore, useMessageMetaStore, useSectionIdStore } = store;
  return useMessagesStore.subscribe(
    state => state.messageGroupList,
    // 这里订阅了 groups，然后非响应式地获取 messages，降低更新频率
    // 目前 groups 的更新完全与 messages 同步，没有按需更新，如果改为按需更新（好像最好是）则无法保证同步触发
    groups => {
      const { messages } = useMessagesStore.getState();
      const metaList = messages.map((_, index) => {
        const initMeta = getInitMetaByMessage({
          index,
          messages,
        });
        return initMeta;
      });
      // all mutate!!
      mutateUpdateMetaByGroupInfo(metaList, groups);

      addAnswerLocation(metaList);

      addJumpVerboseInfo(metaList);

      /**
       * TODO
       * 更新 contextDivider 的方法得留槽,包括 通过 global SectionID 更新的方法需要留槽
       * 新增 config 配置是否展示 context-divider, 关闭 context-divider 展示则不运行此处的计算
       */
      updateMetaListDivider({
        metaList,
        configs,
        latestSectionId: useSectionIdStore.getState().latestSectionId,
      });

      // 处理头像展示逻辑
      scanAndUpdateHideAvatar(metaList, configs);

      /**
       * TODO:
       * agentDivider 方法待实现
       * 需要留槽
       * 新增 config 配置是否展示 agent-divider, 关闭 agent-divider 展示则不运行此处的计算
       */

      useMessageMetaStore.getState().updateMeta(metaList);
    },
  );
};

/**
 * 频率低，就嗯更新；
 * 这上下两处订阅对于数据的处理方式有微妙的差异 可变vs不可变，希望你注意到
 */
export const subscribeSectionIdToUpdateMeta = (
  store: {
    useSectionIdStore: SectionIdStore;
    useMessageMetaStore: MessageMetaStore;
  },
  configs: ChatAreaConfigs,
) => {
  const { useMessageMetaStore, useSectionIdStore } = store;
  return useSectionIdStore.subscribe(
    state => state.latestSectionId,
    latestSectionId => {
      /**
       * TODO
       * 同上，需要留槽，根据 config 决定是否计算
       * agentID 业务上还没有 global 概念，有了再说
       */
      const { updateMetaByImmer } = useMessageMetaStore.getState();
      updateMetaByImmer(metaList => {
        // 处理头像展示逻辑
        scanAndUpdateHideAvatar(metaList, configs);
      });
    },
  );
};
