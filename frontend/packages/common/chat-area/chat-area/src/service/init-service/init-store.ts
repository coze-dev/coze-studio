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

import { type Scene } from '@coze-common/chat-core';
import { exhaustiveCheckForRecord } from '@coze-common/chat-area-utils';
import { type Reporter } from '@coze-arch/logger';

import { createWaitingStore } from '../../store/waiting';
import { createSuggestionsStore } from '../../store/suggestions';
import { createSenderInfoStore } from '../../store/sender-info';
import {
  createSelectionStore,
  subscribeSelectionUpdate,
} from '../../store/selection';
import { createSectionIdStore } from '../../store/section-id';
import { createOnboardingStore } from '../../store/onboarding';
import {
  createMessagesStore,
  subscribeMessageToUpdateMessageGroup,
  subscribeSectionIdToUpdateMessageGroup,
} from '../../store/messages';
import {
  createMessageMetaStore,
  subscribeMessageToUpdateMeta,
  subscribeSectionIdToUpdateMeta,
} from '../../store/message-meta';
import {
  createMessageIndexStore,
  subscribeMessageToUpdateMessageLoadIndex,
} from '../../store/message-index';
import { createGlobalInitStore } from '../../store/global-init';
import { createFileStore } from '../../store/file';
import { createChatActionStore } from '../../store/chat-action';
import { createBatchFileUploadStore } from '../../store/batch-upload-file';
import { createAudioUIStore } from '../../store/audio-ui';
import { getMessageIndexStoreMethods } from '../../plugin/plugin-context/in-life-cycle-context/after-create-store-set/create-get-message-index-store-methods';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import {
  type ChatAreaConfigs,
  type ExtendDataLifecycle,
  type StoreSet,
} from '../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../context/chat-area-context/chat-area-callback';

export interface InitStoreContext {
  scene: Scene;
  mark: string;
  lifeCycleService: SystemLifeCycleService;
  extendDataLifecycle?: ExtendDataLifecycle;
  configs: ChatAreaConfigs;
  reporter: Reporter;
  eventCallback: ChatAreaEventCallback | null;
  prePositionedStoreSet: Pick<StoreSet, 'usePluginStore'>;
}

export class InitStoreService {
  public storeSet: Omit<StoreSet, 'usePluginStore'>;
  private context: InitStoreContext;
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Initialization as expected
  public unsubscribeStore: () => void = () => {};

  constructor(context: InitStoreContext) {
    this.context = context;

    this.storeSet = this.createStoreSet();

    if (!this.storeSet) {
      console.error('init store error');
      return;
    }

    this.subscribeStore();
  }

  /**
   * Execute the life cycle of creation completion, which needs to be delayed appropriately
   */
  public runCreateLifeCycle() {
    if (!this.storeSet) {
      console.error('store set not ready');
      return;
    }

    this.context.lifeCycleService.app.onAfterCreateStores({
      messageIndexStore: getMessageIndexStoreMethods(
        this.storeSet.useMessageIndexStore,
      ),
    });
  }

  /**
   * Create a Normal Store
   */
  private createStoreSet() {
    const useGlobalInitStore = createGlobalInitStore(this.context.mark);
    const useMessageMetaStore = createMessageMetaStore(this.context.mark);
    const useMessagesStore = createMessagesStore(this.context.mark);
    const useSectionIdStore = createSectionIdStore(this.context.mark);
    const useWaitingStore = createWaitingStore(this.context.mark);
    const useOnboardingStore = createOnboardingStore(this.context.mark);
    const useFileStore = createFileStore(this.context.mark);
    const useSuggestionsStore = createSuggestionsStore(this.context.mark);
    const useSelectionStore = createSelectionStore(this.context.mark);
    const useSenderInfoStore = createSenderInfoStore(this.context.mark);
    const useBatchFileUploadStore = createBatchFileUploadStore(
      this.context.mark,
    );
    const useMessageIndexStore = createMessageIndexStore(this.context.mark);
    const useChatActionStore = createChatActionStore(this.context.mark);
    const useAudioUIStore = createAudioUIStore(this.context.mark);

    return {
      useGlobalInitStore,
      useMessageMetaStore,
      useMessagesStore,
      useSectionIdStore,
      useWaitingStore,
      useOnboardingStore,
      useFileStore,
      useSuggestionsStore,
      useSelectionStore,
      useSenderInfoStore,
      useBatchFileUploadStore,
      useMessageIndexStore,
      useChatActionStore,
      useAudioUIStore,
    };
  }

  /**
   * Monitor Store Changes
   */
  private subscribeStore() {
    if (!this.storeSet) {
      return;
    }

    const {
      useMessagesStore,
      useMessageMetaStore,
      useSectionIdStore,
      useSelectionStore,
      useMessageIndexStore,
    } = this.storeSet;

    const unsubscribeMessageToUpdateMeta = subscribeMessageToUpdateMeta(
      {
        useMessagesStore,
        useMessageMetaStore,
        useSectionIdStore,
      },
      this.context.configs,
    );
    const unsubscribeSectionIdToUpdateMeta = subscribeSectionIdToUpdateMeta(
      {
        useMessageMetaStore,
        useSectionIdStore,
      },
      this.context.configs,
    );
    const unsubscribeSelectionUpdate = subscribeSelectionUpdate(
      {
        useMessagesStore,
        useSelectionStore,
      },
      this.context.eventCallback,
      this.context.lifeCycleService,
    );
    const unsubscribeSectionIdToUpdateMessageGroup =
      subscribeSectionIdToUpdateMessageGroup({
        useMessagesStore,
        useSectionIdStore,
      });

    const unsubscribeMessageStoreToUpdateMessageGroup =
      subscribeMessageToUpdateMessageGroup(
        {
          useMessagesStore,
          useSectionIdStore,
        },
        this.context.eventCallback,
        this.context.lifeCycleService,
      );
    const unsubscribeMessageStoreToUpdateMessageLoadIndex =
      subscribeMessageToUpdateMessageLoadIndex({
        useMessageIndexStore,
        useMessagesStore,
      });

    this.unsubscribeStore = () => {
      unsubscribeMessageToUpdateMeta();
      unsubscribeSectionIdToUpdateMeta();
      unsubscribeSelectionUpdate();
      unsubscribeSectionIdToUpdateMessageGroup();
      unsubscribeMessageStoreToUpdateMessageGroup();
      unsubscribeMessageStoreToUpdateMessageLoadIndex();
    };
  }

  /**
   * Clear Store Set
   */
  public clearStoreSet() {
    if (!this.storeSet) {
      return;
    }

    const {
      useBatchFileUploadStore,
      useChatActionStore,
      useFileStore,
      useGlobalInitStore,
      useMessageIndexStore,
      useMessageMetaStore,
      useMessagesStore,
      useOnboardingStore,
      useSectionIdStore,
      useSelectionStore,
      useSenderInfoStore,
      useSuggestionsStore,
      useWaitingStore,
      useAudioUIStore,
      ...rest
    } = this.storeSet;

    exhaustiveCheckForRecord(rest);

    useGlobalInitStore.getState().clearSideEffect();
    useMessageMetaStore.getState().clear();
    useMessagesStore.getState().clearMessageStore();
    useSectionIdStore.getState().clear();
    useWaitingStore.getState().clearAllUnsettledUnconditionally();
    useOnboardingStore.getState().clearOnboardingStore();
    useFileStore.getState().clear();
    useSuggestionsStore.getState().clearSuggestions();
    useSelectionStore.getState().clearSelectedReplyIdList();
    useSenderInfoStore.getState().clearSenderInfoStore();
    useBatchFileUploadStore.getState().clearAllData();
    useMessageIndexStore.getState().clearAll();
    useChatActionStore.getState().clearAll();
    useAudioUIStore.getState().clear();
  }
}
