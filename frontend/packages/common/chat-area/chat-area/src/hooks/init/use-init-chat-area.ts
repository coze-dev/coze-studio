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

import { useShallow } from 'zustand/react/shallow';
import { useRequest } from 'ahooks';
import ChatCore, { type PresetBot, Scene } from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';

import { splitMessageAndSuggestions } from '../../utils/suggestions';
import { SecurityStrategyContext } from '../../utils/message-security-strategy';
import { getIsPolicyException } from '../../utils/get-is-policy-exception';
import { type NormalizeParameter } from '../../typing/util-types';
import { type UserSenderInfo } from '../../store/types';
import { type GlobalInitStore } from '../../store/global-init';
import { type LoadMoreClient } from '../../service/load-more';
import { listenMessageUpdate } from '../../service/listen-message-update';
import { fixHistoryMessageList } from '../../service/fix-message/fix-history-message-list';
import { type ChatActionLockService } from '../../service/chat-action-lock';
import { getReportError, ReportEventNames } from '../../report-events';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import {
  type ChatAreaConfigs,
  type ChatAreaProviderProps,
  type MixInitResponse,
  type StoreSet,
} from '../../context/chat-area-context/type';
import { generateChatCoreBiz } from '../../context/chat-area-context/helpers/generate-chat-core-props';

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function
export const useInitChatArea = ({
  requestToInit,
  botId,
  spaceId,
  presetBot,
  scene,
  reporter,
  userInfo,
  eventCallback,
  configs,
  storeSet,
  createChatCoreOverrideConfig,
  enableChatCoreDebug,
  lifeCycleService,
  loadMoreClient,
  chatActionLockService,
}: NormalizeParameter<
  Pick<
    ChatAreaProviderProps,
    | 'requestToInit'
    | 'botId'
    | 'spaceId'
    | 'presetBot'
    | 'scene'
    | 'userInfo'
    | 'reporter'
    | 'eventCallback'
    | 'createChatCoreOverrideConfig'
    | 'enableChatCoreDebug'
  >
> & {
  configs: ChatAreaConfigs;
  storeSet: StoreSet;
  lifeCycleService: SystemLifeCycleService;
  loadMoreClient: LoadMoreClient;
  chatActionLockService: ChatActionLockService;
}) => {
  const {
    useGlobalInitStore,
    useMessagesStore,
    useWaitingStore,
    useSuggestionsStore,
    useSectionIdStore,
  } = storeSet;

  const recordMessageOnboardingSectionIdSuggestions =
    useRecordMessageOnboardingSectionIdSuggestions({
      storeSet,
      reporter,
      ignoreMessageConfigList: configs.ignoreMessageConfigList,
    });

  const {
    initStatus,
    setChatCore,
    setChatCoreOffListen,
    setInitStatus,
    setConversationId,
  } = useGlobalInitStore(
    useShallow(state => ({
      initStatus: state.initStatus,
      setChatCore: state.setChatCore,
      setChatCoreOffListen: state.setChatCoreOffListen,
      setInitStatus: state.setInitStatus,
      setConversationId: state.setConversationId,
    })),
  );

  const { updateSenderInfo, clearSenderInfoStore } = useUpdateSenderInfo(
    storeSet,
    userInfo,
  );

  const clearWaitingStore = useWaitingStore(state => state.clearWaitingStore);

  useInitUploadPluginByUserInfo(
    useGlobalInitStore,
    userInfo,
    configs.uploadPlugin,
  );

  const {
    data,
    loading: requestLoading,
    refresh,
    cancel,
    run,
  } = useRequest(
    async () => {
      if (useGlobalInitStore.getState().initStatus === 'initSuccess') {
        return;
      }
      return requestToInit();
    },
    {
      // Invalid refreshDeps when manual is specified; explicitly reinitializes externally based on requestToInit changes
      manual: true,
      onBefore: () => {
        setInitStatus('loading');
        lifeCycleService.app.onBeforeInitial();
        loadMoreClient.clearMessageIndexStore();
      },
      onError: inputError => {
        setInitStatus('initFail');
        eventCallback?.onInitError?.();
        lifeCycleService.app.onInitialError();
        const { error, meta } = getReportError(inputError);
        reporter.errorEvent({
          eventName: ReportEventNames.Init,
          error,
          meta: Object.assign({}, meta, {
            isPolicyException: getIsPolicyException(error),
          }),
        });
      },
    },
  );

  useEffect(() => {
    if (initStatus === 'initSuccess') {
      return;
    }

    // At least you have to load it for a while, unless there is a local cache?
    if (initStatus === 'unInit') {
      return;
    }

    if (requestLoading) {
      return;
    }

    // In theory, there should be no problem here. You need to wait for lifeCycleService Ready before initializing, otherwise the life cycle cannot be triggered.
    if (!lifeCycleService) {
      return;
    }

    // This is a new addition and should be safe in theory.
    if (!data) {
      return;
    }

    loadMoreClient.handleInitialLoadIndex(data);

    if (!data?.conversationId) {
      reporter.errorEvent({
        eventName: ReportEventNames.Init,
        error: new Error('Invalid Response without conversationId'),
      });

      setInitStatus('initFail');
      eventCallback?.onInitError?.();
      lifeCycleService.app.onInitialError();
      return;
    }

    setConversationId(data.conversationId);

    updateSenderInfo(data);

    const localeChatCore = new ChatCore({
      bot_version: data.botVersion,
      conversation_id: data.conversationId,
      bot_id: botId,
      space_id: spaceId,
      preset_bot: presetBot as PresetBot,
      draft_mode: scene === Scene.Playground,
      biz: generateChatCoreBiz(scene),
      env: IS_DEV_MODE ? 'local' : IS_PROD ? 'production' : 'boe',
      deployVersion: IS_RELEASE_VERSION ? 'release' : 'inhouse',
      logLevel: IS_DEV_MODE ? 'info' : 'error',
      scene,
      enableDebug: enableChatCoreDebug,
      ...createChatCoreOverrideConfig,
    });
    setChatCore(localeChatCore);

    setChatCoreOffListen(
      listenMessageUpdate({
        chatCore: localeChatCore,
        useMessagesStore,
        useWaitingStore,
        useSuggestionsStore,
        useSectionIdStore,
        reporter,
        eventCallback: eventCallback ?? {},
        configs,
        securityStrategyContext: new SecurityStrategyContext({
          storeSet,
          reporter,
          eventCallback,
          lifeCycleService,
          chatActionLockService,
        }),
        lifeCycleService,
      }),
    );

    recordMessageOnboardingSectionIdSuggestions(data);

    reporter.successEvent({ eventName: ReportEventNames.Init });
    setInitStatus('initSuccess');

    eventCallback?.onInitSuccess?.();
    lifeCycleService.app.onAfterInitial({
      ctx: {
        messageListFromService: data,
      },
    });
  }, [data, requestLoading, lifeCycleService]);

  /**
   * A seemingly safe init chat-area side effect cleanup, containing:
   * - Clear chat core
   * - chat core monitoring clear
   * - useRequest status cleanup (ready = > false, cancel)
   */
  const clearInitSideEffect = () => {
    clearSenderInfoStore();
    clearWaitingStore();
    cancel();
    useGlobalInitStore.getState().clearSideEffect();
  };

  return {
    refresh,
    executeInit: run,
    clearInitSideEffect,
  };
};

const useRecordMessageOnboardingSectionIdSuggestions = ({
  storeSet,
  reporter,
  ignoreMessageConfigList,
}: {
  storeSet: Pick<
    StoreSet,
    | 'useOnboardingStore'
    | 'useMessagesStore'
    | 'useSectionIdStore'
    | 'useSuggestionsStore'
  >;
  reporter: Reporter;
  ignoreMessageConfigList: ChatAreaConfigs['ignoreMessageConfigList'];
}) => {
  const {
    useOnboardingStore,
    useMessagesStore,
    useSectionIdStore,
    useSuggestionsStore,
  } = storeSet;
  const partialUpdateOnboardingData = useOnboardingStore(
    state => state.partialUpdateOnboardingData,
  );
  const { addMessages } = useMessagesStore(
    useShallow(state => ({
      addMessages: state.addMessages,
    })),
  );
  return (data: MixInitResponse) => {
    const { lastSectionId, messageList, prologue, onboardingSuggestions } =
      data;

    useSectionIdStore.getState().setLatestSectionId(lastSectionId || '');

    const fixedMessageList = fixHistoryMessageList({
      historyMessageList: messageList ?? [],
      ignoreMessageConfigList,
      reporter,
    });

    if (fixedMessageList) {
      addMessages(fixedMessageList, { clearFirst: true });
      const { idAndSuggestions } = splitMessageAndSuggestions(fixedMessageList);
      useSuggestionsStore.getState().updateSuggestionsBatch(idAndSuggestions);
    }

    partialUpdateOnboardingData(prologue, onboardingSuggestions);
  };
};

const useUpdateSenderInfo = (
  storeSet: StoreSet,
  userInfo: UserSenderInfo | null,
) => {
  const { useSenderInfoStore, useOnboardingStore } = storeSet;
  const {
    setBotInfoMap,
    setUserInfoMap,
    updateUserInfo,
    clearSenderInfoStore,
    userInfo: userInfoInStore,
  } = useSenderInfoStore(
    useShallow(state => ({
      setBotInfoMap: state.setBotInfoMap,
      setUserInfoMap: state.setUserInfoMap,
      updateUserInfo: state.updateUserInfo,
      clearSenderInfoStore: state.clearSenderInfoStore,
      userInfo: state.userInfo,
    })),
  );

  const recordBotInfo = useOnboardingStore(state => state.recordBotInfo);

  useEffect(() => {
    if (userInfoInStore || !userInfo) {
      return;
    }
    updateUserInfo(userInfo);
  }, [userInfoInStore, userInfo]);

  const updateSenderInfo = (data: MixInitResponse) => {
    // Update user information
    const { botInfoMap, userInfoMap } = data;

    if (botInfoMap) {
      setBotInfoMap(botInfoMap);

      // Todo: remove temporary logic
      const botInfo = Object.values(botInfoMap).at(0);
      recordBotInfo({
        name: botInfo?.nickname,
        avatar: botInfo?.url,
      });
    }

    if (userInfoMap) {
      setUserInfoMap(userInfoMap);
    }
  };

  return {
    updateSenderInfo,
    clearSenderInfoStore,
  };
};

const useInitUploadPluginByUserInfo = (
  useGlobalInitStore: GlobalInitStore,
  userInfo: UserSenderInfo | null,
  uploadPlugin: ChatAreaConfigs['uploadPlugin'],
) => {
  const chatCore = useGlobalInitStore(state => state.chatCore);
  useEffect(() => {
    if (!userInfo?.id || !chatCore) {
      return;
    }
    const uploadPluginName = 'upload-plugin';
    if (chatCore.checkPluginIsRegistered(uploadPluginName)) {
      return;
    }
    chatCore.registerPlugin(uploadPluginName, uploadPlugin, {
      userId: userInfo.id,
      appId: APP_ID,
    });
  }, [userInfo?.id, chatCore]);
};
