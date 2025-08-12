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
 * Automatically regenerate meta lists based on messages changes;
 * This layer is not optimized, and in-depth comparison is carried out when consuming meta in the component;
 * We will see if further optimization is required in the future.
 * There are subtle differences in how the upper and lower subscriptions handle data, mutable vs immutable, I hope you notice
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
    // Subscribe to groups here, and then get messages non-responsively to reduce the update frequency
    // At present, the updates of groups are fully synchronized with messages, and there are no on-demand updates. If you change to on-demand updates (as if it were best), there is no guarantee that the synchronization will trigger.
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
       * Methods to update contextDivider require slots, including methods updated through global SectionID
       * Add config to configure whether to display the context-divider. If you close the context-divider display, you will not run the calculation here.
       */
      updateMetaListDivider({
        metaList,
        configs,
        latestSectionId: useSectionIdStore.getState().latestSectionId,
      });

      // Handling avatar display logic
      scanAndUpdateHideAvatar(metaList, configs);

      /**
       * TODO:
       * agentDivider method to be implemented
       * Need to leave a slot
       * Add config to configure whether to display the agent-divider, turn off the agent-divider display and do not run the calculation here
       */

      useMessageMetaStore.getState().updateMeta(metaList);
    },
  );
};

/**
 * If the frequency is low, it will be updated.
 * There are subtle differences in how the upper and lower subscriptions handle data, mutable vs immutable, I hope you notice
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
       * Ditto, you need to leave a slot, and decide whether to calculate according to the config.
       * There is no global concept in agentID business, let's talk about it once we have it
       */
      const { updateMetaByImmer } = useMessageMetaStore.getState();
      updateMetaByImmer(metaList => {
        // Handling avatar display logic
        scanAndUpdateHideAvatar(metaList, configs);
      });
    },
  );
};
