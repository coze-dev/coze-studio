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

import { useEffect } from 'react';

import { useCreation } from 'ahooks';
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
  subscribeSectionIdToUpdateMessageGroup,
  subscribeMessageToUpdateMessageGroup,
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
import {
  recordLifecycleExtendedData,
  retrieveAndClearLifecycleExtendedData,
} from '../../service/extend-data-lifecycle';
import { type OnAfterCallback } from '../../plugin/types/plugin-class/app-life-cycle';
import { getMessageIndexStoreMethods } from '../../plugin/plugin-context/in-life-cycle-context/after-create-store-set/create-get-message-index-store-methods';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import {
  type ChatAreaConfigs,
  type ExtendDataLifecycle,
  type StoreSet,
} from '../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../context/chat-area-context/chat-area-callback';

export const useSubscribeStore = ({
  storeSet,
  eventCallback,
  configs,
  scene,
  extendDataLifecycle = 'disable',
  lifeCycleService,
}: {
  storeSet: StoreSet;
  eventCallback: ChatAreaEventCallback | null;
  configs: ChatAreaConfigs;
  scene: Scene;
  reporter: Reporter;
  extendDataLifecycle?: ExtendDataLifecycle;
  lifeCycleService: SystemLifeCycleService;
}): StoreSet => {
  const {
    useMessagesStore,
    useMessageMetaStore,
    useSectionIdStore,
    useSelectionStore,
    useMessageIndexStore,
  } = storeSet;

  // Enter during initialization
  useEffect(() => {
    if (extendDataLifecycle === 'full-site') {
      recordLifecycleExtendedData(scene, storeSet);
    }
  }, []);

  useEffect(() => {
    const unsubscribeMessageToUpdateMeta = subscribeMessageToUpdateMeta(
      {
        useMessagesStore,
        useMessageMetaStore,
        useSectionIdStore,
      },
      configs,
    );
    const unsubscribeSectionIdToUpdateMeta = subscribeSectionIdToUpdateMeta(
      {
        useMessageMetaStore,
        useSectionIdStore,
      },
      configs,
    );
    const unsubscribeSelectionUpdate = subscribeSelectionUpdate(
      {
        useMessagesStore,
        useSelectionStore,
      },
      eventCallback,
      lifeCycleService,
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
        eventCallback,
        lifeCycleService,
      );
    const unsubscribeMessageStoreToUpdateMessageLoadIndex =
      subscribeMessageToUpdateMessageLoadIndex({
        useMessageIndexStore,
        useMessagesStore,
      });
    return () => {
      unsubscribeMessageToUpdateMeta();
      unsubscribeSectionIdToUpdateMeta();
      unsubscribeSelectionUpdate();
      unsubscribeSectionIdToUpdateMessageGroup();
      unsubscribeMessageStoreToUpdateMessageGroup();
      unsubscribeMessageStoreToUpdateMessageLoadIndex();
    };
  }, []);

  return storeSet;
};

export const useCreateAllStoreSet = ({
  extendDataLifecycle = 'disable',
  mark,
  scene,
  onAfterCallback,
}: {
  extendDataLifecycle?: ExtendDataLifecycle;
  mark: string;
  scene: Scene;
  onAfterCallback: (stores: OnAfterCallback) => void;
}): Omit<StoreSet, 'usePluginStore'> => {
  const preStore = useCreation(
    () =>
      extendDataLifecycle === 'full-site'
        ? retrieveAndClearLifecycleExtendedData(scene)
        : null,
    [],
  );
  const useGlobalInitStore = useCreation(
    () => preStore?.useGlobalInitStore || createGlobalInitStore(mark),
    [],
  );
  const useMessageMetaStore = useCreation(
    () => preStore?.useMessageMetaStore || createMessageMetaStore(mark),
    [],
  );
  const useMessagesStore = useCreation(
    () => preStore?.useMessagesStore || createMessagesStore(mark),
    [],
  );
  const useSectionIdStore = useCreation(
    () => preStore?.useSectionIdStore || createSectionIdStore(mark),
    [],
  );
  const useWaitingStore = useCreation(
    () => preStore?.useWaitingStore || createWaitingStore(mark),
    [],
  );
  const useOnboardingStore = useCreation(
    () => preStore?.useOnboardingStore || createOnboardingStore(mark),
    [],
  );
  const useFileStore = useCreation(
    () => preStore?.useFileStore || createFileStore(mark),
    [],
  );
  const useSuggestionsStore = useCreation(
    () => preStore?.useSuggestionsStore || createSuggestionsStore(mark),
    [],
  );
  const useSelectionStore = useCreation(
    () => preStore?.useSelectionStore || createSelectionStore(mark),
    [],
  );
  const useSenderInfoStore = useCreation(
    () => preStore?.useSenderInfoStore || createSenderInfoStore(mark),
    [],
  );
  const useBatchFileUploadStore = useCreation(
    () => preStore?.useBatchFileUploadStore || createBatchFileUploadStore(mark),
    [],
  );

  const useMessageIndexStore = useCreation(
    () => preStore?.useMessageIndexStore || createMessageIndexStore(mark),
    [],
  );

  const useChatActionStore = useCreation(
    () => preStore?.useChatActionStore || createChatActionStore(mark),
    [],
  );

  const useAudioUIStore = useCreation(
    () => preStore?.useAudioUIStore || createAudioUIStore(mark),
    [],
  );

  // TODO: In the future, the timing of plugin registration will be advanced to solve the problem of changing state during rendering @lihuiwen @liushuoyan
  onAfterCallback({
    messageIndexStore: getMessageIndexStoreMethods(useMessageIndexStore),
  });

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
};

export const clearStoreSet = (storeSet: StoreSet) => {
  const {
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
    usePluginStore,
    useMessageIndexStore,
    useChatActionStore,
    useAudioUIStore,
    ...rest
  } = storeSet;
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
  usePluginStore.getState().clearPluginStore();
  useMessageIndexStore.getState().clearAll();
  useChatActionStore.getState().clearAll();
  useAudioUIStore.getState().clear();
};
