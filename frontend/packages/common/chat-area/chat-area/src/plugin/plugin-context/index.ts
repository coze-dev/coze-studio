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

import { type Reporter } from '@coze-arch/logger';

import { type MethodCommonDeps } from '../types';
import { type SystemLifeCycleService } from '../life-cycle';
import { getClearHistoryImplement } from '../../hooks/messages/use-clear-history';
import { useDeleteFile } from '../../hooks/file/use-delete-file';
import { useGetScrollView } from '../../hooks/context/use-get-scroll-view';
import { useChatInputLayout } from '../../context/chat-input-layout';
import { type StoreSet } from '../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../context/chat-area-context/chat-area-callback';
import { createWriteableSectionIdMethods } from './writeable-methods/create-section-id-methods';
import { createWriteableMessageMethods } from './writeable-methods/create-message-methods';
import { createSubscribeWaiting } from './subscribes/create-subscribe-waiting';
import { createSubscribeSelection } from './subscribes/create-subscribe-selection';
import { createSubscribeOnboarding } from './subscribes/create-subscribe-onboarding';
import { createSubscribeMessageMeta } from './subscribes/create-subscribe-message-meta';
import { createSubscribeMessage } from './subscribes/create-subscribe-message';
import { createSubscribeGlobalInitState } from './subscribes/create-subscribe-global-init-state';
import { getOnboardingStoreWriteableMethods } from './store-writeable-methods/onbaording-store';
import { getMessagesStoreWriteableMethods } from './store-writeable-methods/messags-store';
import { getMessageIndexStoreWriteableMethods } from './store-writeable-methods/message-index-store';
import { getMessagesStoreReadonlyMethods } from './store-readonly-methods/messages-store';
import { getMessageMetaStoreReadonlyMethods } from './store-readonly-methods/message-meta-store';
import { createGetBotInfoStoreReadonlyMethods } from './store-readonly-methods/bot-info-store';
import { createGetBatchFileStoreReadonlyMethods } from './store-readonly-methods/batch-upload-store';
import { createSectionIdInstantValues } from './store-instant-values/create-section-id-instant-values';
import { createGetMessagesStoreInstantValues } from './store-instant-values/create-get-messages-store-instant-values';
import { createGetMessageMetaStoreInstantValues } from './store-instant-values/create-get-message-meta-store-instant-values';
import { createGetGlobalInitStoreInstantValues } from './store-instant-values/create-get-global-init-store-instant-values';
import { createMessageMethods } from './methods/create-message-methods';

export interface CreateChatAreaPluginContextParams {
  storeSet: StoreSet;
  refreshMessageList: () => void;
  eventCallback: ChatAreaEventCallback | undefined;
  reporter: Reporter;
  lifeCycleService: SystemLifeCycleService;
  getCommonDeps: () => MethodCommonDeps;
}

export const createChatAreaPluginContext = (
  params: CreateChatAreaPluginContextParams,
) => {
  const {
    storeSet,
    eventCallback,
    reporter,
    lifeCycleService,
    refreshMessageList,
    getCommonDeps,
  } = params;
  const {
    useGlobalInitStore,
    useMessageMetaStore,
    useMessagesStore,
    useOnboardingStore,
    useSelectionStore,
    useWaitingStore,
    usePluginStore,
    useSenderInfoStore,
    useMessageIndexStore,
    useBatchFileUploadStore,
    useSectionIdStore,
  } = storeSet;
  const deps = getCommonDeps();

  const pluginContext = {
    limitSubscriptions: {
      subscribeGlobalInit: createSubscribeGlobalInitState(
        useGlobalInitStore,
        usePluginStore,
      ),
      subscribeMessage: createSubscribeMessage(
        useMessagesStore,
        usePluginStore,
      ),
      subscribeMessageMeta: createSubscribeMessageMeta(
        useMessageMetaStore,
        usePluginStore,
      ),
      subscribeOnboarding: createSubscribeOnboarding(
        useOnboardingStore,
        usePluginStore,
      ),
      subscribeSelection: createSubscribeSelection(
        useSelectionStore,
        usePluginStore,
      ),
      subscribeWaiting: createSubscribeWaiting(useWaitingStore, usePluginStore),
    },
    writeableAPI: {
      messageList: {
        ...createMessageMethods({
          refreshMessageList,
        }),
        ...getMessagesStoreWriteableMethods(useMessagesStore),
        clearChatHistory: getClearHistoryImplement(deps),
      },
      messageIndex: {
        ...getMessageIndexStoreWriteableMethods(useMessageIndexStore),
      },
      message: createWriteableMessageMethods({
        storeSet,
        eventCallback,
        lifeCycleService,
        reporter,
        deps,
      }),
      onboarding: getOnboardingStoreWriteableMethods(useOnboardingStore),
      sectionId: createWriteableSectionIdMethods(useSectionIdStore),
    },
    readonlyAPI: {
      globalInit: {
        getGlobalInitStoreInstantValues:
          createGetGlobalInitStoreInstantValues(useGlobalInitStore),
      },
      message: {
        getMessagesStoreInstantValues:
          createGetMessagesStoreInstantValues(useMessagesStore),
        ...getMessagesStoreReadonlyMethods(useMessagesStore),
      },
      messageMeta: {
        getMessageMetaInstantValues:
          createGetMessageMetaStoreInstantValues(useMessageMetaStore),
        ...getMessageMetaStoreReadonlyMethods(useMessageMetaStore),
      },
      botInfo: {
        getBotInfoStoreInstantValues:
          createGetBotInfoStoreReadonlyMethods(useSenderInfoStore),
      },
      batchFile: {
        getFileStoreInstantValues: createGetBatchFileStoreReadonlyMethods(
          useBatchFileUploadStore,
        ),
      },
      sectionId: {
        getSectionIdInstantValues:
          createSectionIdInstantValues(useSectionIdStore),
      },
    },
    readonlyHook: {
      scrollView: {
        useGetScrollView,
      },
      input: {
        useChatInputLayout,
      },
    },
    writeableHook: {
      file: {
        useDeleteFile,
      },
    },
  };

  return pluginContext;
};
