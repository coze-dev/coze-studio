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

/* eslint-disable max-lines */
import { type MutableRefObject } from 'react';

import mitt, { type Emitter } from 'mitt';
import ChatCore, {
  type Biz,
  type PresetBot,
  Scene,
  type CreateProps,
} from '@coze-common/chat-core';
import { getReportError } from '@coze-common/chat-area-utils';
import { type Reporter } from '@coze-arch/logger';
import { DeveloperApi } from '@coze-arch/bot-api';

import { LoadMoreEnvTools } from '../load-more/load-more-env-tools';
import { LoadMoreClient } from '../load-more';
import { listenMessageUpdate } from '../listen-message-update';
import { fixHistoryMessageList } from '../fix-message/fix-history-message-list';
import {
  clearExtendedLifecycleData,
  recordInitServiceController,
} from '../extend-data-lifecycle';
import { ChatActionLockService } from '../chat-action-lock';
import { splitMessageAndSuggestions } from '../../utils/suggestions';
import { stopResponding } from '../../utils/stop-responding';
import { SecurityStrategyContext } from '../../utils/message-security-strategy';
import { initPlugins } from '../../utils/init-plugins';
import { getIsPolicyException } from '../../utils/get-is-policy-exception';
import { destroyFileManager } from '../../utils/file-manage';
import { type UserSenderInfo } from '../../store/types';
import { ReportEventNames } from '../../report-events/report-event-names';
import { type PluginRegistryEntry } from '../../plugin/types/register-plugin';
import type { MethodCommonDeps } from '../../plugin/types';
import { SystemLifeCycleService } from '../../plugin/life-cycle';
import { getLoadRequest } from '../../hooks/context/load-more/get-load-request';
import {
  getChatProcessing,
  getListenProcessChatStateChange,
} from '../../hooks/context/load-more/get-listen-process-chat-state-change';
import { getInsertMessages } from '../../hooks/context/load-more/get-insert-messages';
import {
  type StoreSet,
  type MixInitResponse,
  type ChatAreaConfigs,
  type ExtendDataLifecycle,
  type EventCenter,
} from '../../context/chat-area-context/type';
import { generateChatCoreBiz } from '../../context/chat-area-context/helpers/generate-chat-core-props';
import { type ChatAreaEventCallback } from '../../context/chat-area-context/chat-area-callback';
import { PreInitStoreService } from './pre-init-store';
import { InitStoreService } from './init-store';

interface InitContext {
  requestToInit: () => Promise<MixInitResponse>;
  eventCallback: ChatAreaEventCallback | undefined;
  reporter: Reporter;
  botId: string | undefined;
  spaceId?: string;
  presetBot: PresetBot | undefined;
  scene: Scene;
  userInfo: UserSenderInfo | null;
  enableChatCoreDebug: boolean | undefined;
  createChatCoreOverrideConfig:
    | Partial<Omit<CreateProps, 'bot_version' | 'bot_id' | 'conversation_id'>>
    | undefined;
  configs: ChatAreaConfigs;
  enableChatActionLock: boolean | undefined;
  extendDataLifecycle: ExtendDataLifecycle | undefined;
  loadMoreFlagRef: MutableRefObject<{
    enableTwoWayLoad: boolean;
    enableMarkRead: boolean;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginRegistryList: PluginRegistryEntry<any>[] | undefined;
}

const enum InitStatus {
  UnInit = 'unInit',
  Loading = 'loading',
  Success = 'initSuccess',
  Failed = 'initFail',
}

export class InitService {
  private latestRequestIndex = 0;
  /**
   * Context information currently in use
   */
  private context: InitContext;
  /**
   * Store context information available for the next round (reinitialization)
   */
  private nextContext: InitContext | null = null;
  /**
   * Whether to cancel the request flag
   */
  private requestAborted = false;
  /**
   * Store mark information
   */
  private mark!: Biz;
  /**
   * Front Initialization Store Service
   */
  private preInitStoreService!: PreInitStoreService;
  /**
   * Store service
   */
  private initStoreService!: InitStoreService;
  /**
   * Load more unlistening events
   */
  private loadMoreDispose!: () => void;
  /**
   * plugin destruction event
   */
  private destroyPlugins!: () => void;

  /**
   * reporter
   */
  public reporter!: Reporter;
  /**
   * lifecycle services
   */
  public lifeCycleService!: SystemLifeCycleService;
  /**
   * Lock service
   */
  public chatActionLockService!: ChatActionLockService;
  /**
   * Event Center
   */
  public eventCenter: Emitter<EventCenter> = mitt<EventCenter>();
  /**
   * Load more services
   */
  public loadMoreClient!: LoadMoreClient;
  /**
   * Load more service environment tools
   */
  public loadMoreEnvTools!: LoadMoreEnvTools;
  /**
   * Store Set Information
   */
  public storeSet!: StoreSet;
  // ! Are you going to add properties? Please note that using! is explicit and needs to be supplemented with runtime checks into the assertInitialized function

  /**
   * construction method
   */
  constructor(context: InitContext) {
    this.context = context;

    this.initServices();
    this.assertInitialized();

    // After creating LoadMore, perform a location to the message
    this.locateToUnreadMessage();
    this.init();
  }

  /**
   * When running, determine whether the necessary data for initialization is correct
   */
  private assertInitialized() {
    const {
      loadMoreClient,
      loadMoreDispose,
      loadMoreEnvTools,
      mark,
      reporter,
      lifeCycleService,
      chatActionLockService,
      destroyPlugins,
      initStoreService,
      preInitStoreService,
      storeSet,
    } = this;

    // The type check can't seem to be written -. - can't get the data of the private property, so I won't check it here

    if (
      !loadMoreClient ||
      !loadMoreEnvTools ||
      !mark ||
      !reporter ||
      !lifeCycleService ||
      !chatActionLockService ||
      !destroyPlugins ||
      !loadMoreDispose ||
      !initStoreService ||
      !preInitStoreService ||
      !storeSet
    ) {
      throw new Error('InitService error');
    }
  }

  /**
   * initialization service
   */
  private initServices() {
    this.mark = generateChatCoreBiz(this.context.scene);
    this.reporter = this.context.reporter.createReporterWithPreset({
      namespace: 'bot-platform',
    });

    // Create Pre-Store Initialization Service
    this.preInitStoreService = new PreInitStoreService({
      mark: this.mark,
      scene: this.context.scene,
      extendDataLifecycle: this.context.extendDataLifecycle,
      reporter: this.reporter,
    });

    // Create a system lifecycle service
    this.lifeCycleService = new SystemLifeCycleService({
      reporter: this.reporter,
      usePluginStore:
        this.preInitStoreService.prePositionedStoreSet.usePluginStore,
    });

    // Create Normal Store Initialization Service
    this.initStoreService = new InitStoreService({
      scene: this.context.scene,
      mark: this.mark,
      lifeCycleService: this.lifeCycleService,
      extendDataLifecycle: this.context.extendDataLifecycle,
      configs: this.context.configs,
      reporter: this.reporter,
      eventCallback: this.context.eventCallback ?? null,
      prePositionedStoreSet: this.preInitStoreService.prePositionedStoreSet,
    });

    this.storeSet = {
      ...this.initStoreService.storeSet,
      ...this.preInitStoreService.prePositionedStoreSet,
    };

    // Create mutual exclusions
    this.chatActionLockService = this.createChatActionLockService();

    // Create a LoadMore service
    const { loadMoreClient, loadMoreDispose, loadMoreEnvTools } =
      this.createLoadMoreService();
    const commonDeps: MethodCommonDeps = {
      context: {
        lifeCycleService: this.lifeCycleService,
        eventCallback: this.context.eventCallback,
        reporter: this.context.reporter,
      },
      services: {
        loadMoreClient,
        chatActionLockService: this.chatActionLockService,
      },
      storeSet: this.storeSet,
    };
    // registration plugin system
    this.destroyPlugins = initPlugins({
      pluginRegistryList: this.context.pluginRegistryList,
      storeSet: this.storeSet,
      refreshMessageList: this.refreshMessageList,
      eventCallback: this.context.eventCallback,
      reporter: this.reporter,
      lifeCycleService: this.lifeCycleService,
      getCommonDeps: () => commonDeps,
    });

    // Wait for the plugin to be registered before executing the relevant life cycle
    this.initStoreService.runCreateLifeCycle();
    this.loadMoreClient = loadMoreClient;
    this.loadMoreDispose = loadMoreDispose;
    this.loadMoreEnvTools = loadMoreEnvTools;
  }

  /**
   * Dynamic Update Context
   */
  public updateContext = (
    context: Pick<
      InitContext,
      'requestToInit' | 'userInfo' | 'createChatCoreOverrideConfig'
    >,
  ) => {
    this.nextContext = {
      ...this.context,
      ...context,
    };
  };

  public immediatelyUpdateContext = (
    context: Pick<InitContext, 'userInfo' | 'createChatCoreOverrideConfig'>,
  ) => {
    this.context = {
      ...this.context,
      ...context,
    };
  };
  /**
   * Initialize the main method
   */
  public init = async () => {
    // If it has been initialized successfully before, it will not be initialized.
    if (
      this.storeSet.useGlobalInitStore.getState().initStatus ===
      InitStatus.Success
    ) {
      return;
    }

    this.lifeCycleService.app.onBeforeInitial();

    const requestData = await this.processInit();

    if (!requestData) {
      return;
    }

    this.reporter.successEvent({ eventName: ReportEventNames.Init });
    this.lifeCycleService.app.onAfterInitial({
      ctx: {
        messageListFromService: requestData,
      },
    });

    recordInitServiceController(this.context.scene, this);
  };

  /**
   * @Experimental experimental function, not re-tested, please focus on testing when using it
   * Refresh message list
   */
  public refreshMessageList = async () => {
    this.lifeCycleService.app.onBeforeRefreshMessageList();

    await stopResponding({
      storeSet: this.storeSet,
      lifeCycleService: this.lifeCycleService,
      reporter: this.reporter,
    });

    if (this.nextContext) {
      this.context = this.nextContext;
    }

    try {
      const requestData = await this.processInit();

      if (!requestData) {
        this.lifeCycleService.app.onRefreshMessageListError({
          ctx: {
            error: new Error('request data is empty'),
          },
        });
      }
    } catch (error) {
      this.lifeCycleService.app.onRefreshMessageListError({
        ctx: {
          error,
        },
      });
    } finally {
      this.lifeCycleService.app.onAfterRefreshMessageList();
    }
  };

  /**
   * Creating an operational mutual exclusion service
   */
  private createChatActionLockService() {
    // Action mutual exclusion
    const {
      getAnswerActionLockMap,
      getGlobalActionLock,
      updateGlobalActionLockByImmer,
      updateAnswerActionLockMapByImmer,
    } = this.storeSet.useChatActionStore.getState();

    return new ChatActionLockService({
      updateGlobalActionLockByImmer,
      getGlobalActionLock,
      updateAnswerActionLockMapByImmer,
      getAnswerActionLockMap,
      readEnvValues: () => ({
        enableChatActionLock: this.context.enableChatActionLock ?? false,
      }),
      reporter: this.context.reporter,
    });
  }

  /**
   * Create a LoadMore service
   */
  private createLoadMoreService() {
    const { useMessageIndexStore, useGlobalInitStore, useWaitingStore } =
      this.storeSet;

    const { listenProcessChatStateChange, forceDispose } =
      getListenProcessChatStateChange(this.storeSet.useWaitingStore);

    this.loadMoreDispose = forceDispose;

    const loadMoreEnv = (() => {
      // Actions are all stable references, no on-site calculations required
      const {
        updateCursor,
        updateIndex,
        updateHasMore,
        updateLockAndErrorByImmer,
        resetCursors,
        resetHasMore,
        resetLoadLockAndError,
        alignMessageIndexes,
        clearAll,
      } = useMessageIndexStore.getState();
      const envTools: LoadMoreEnvTools = new LoadMoreEnvTools({
        reporter: this.reporter,
        updateCursor,
        updateHasMore,
        updateIndex,
        resetCursors,
        resetHasMore,
        resetLoadLockAndError,
        alignMessageIndexes,
        updateLockAndErrorByImmer,
        clearMessageIndexStore: clearAll,
        insertMessages: getInsertMessages(
          this.storeSet,
          this.context.eventCallback?.onBeforeLoadMoreInsertMessages,
        ),
        loadRequest: getLoadRequest({
          reporter: this.reporter,
          getChatCore: () => envTools.chatCore,
          ignoreMessageConfigList: this.context.configs.ignoreMessageConfigList,
          lifeCycleService: this.lifeCycleService,
        }),
        requestMessageIndex: conversationId =>
          DeveloperApi.GetConversationParticipantsReadIndex({
            conversation_id:
              conversationId ||
              useGlobalInitStore.getState().conversationId ||
              '',
          }),
        // Value, requires on-site calculation at runtime
        readEnvValues: () => {
          const state = useMessageIndexStore.getState();
          const waitingState = useWaitingStore.getState();
          return {
            ...this.context.loadMoreFlagRef.current,
            ...state,
            isProcessingChat: getChatProcessing(waitingState),
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        waitMessagesLengthChangeLayoutEffect: () => {},
        listenProcessChatStateChange,
      });
      return envTools;
    })();

    return {
      loadMoreEnvTools: loadMoreEnv,
      loadMoreClient: new LoadMoreClient(loadMoreEnv),
      loadMoreDispose: forceDispose,
    };
  }

  /**
   * Locate unread messages
   */
  private locateToUnreadMessage() {
    this.loadMoreClient.locateToUnreadMessage({
      messages: this.storeSet.useMessagesStore.getState().messages,
      readIndex: this.storeSet.useMessageIndexStore.getState().readIndex,
    });
  }

  /**
   * Function to clear side effects
   */
  private clearInitSideEffect() {
    this.initStoreService.clearStoreSet();
    this.preInitStoreService.clearStoreSet();
  }

  /**
   * ChatArea Destruction
   */
  public destroy = (params?: { disableSkip: boolean }) => {
    const ableToSkip = this.getIsSkipInit();
    if (ableToSkip && !params?.disableSkip) {
      return;
    }
    this.lifeCycleService?.app.onBeforeDestroy();
    // side effect clear
    this.abortRequest();
    // state clear
    this.storeSet?.useMessageIndexStore
      .getState()
      .setScrollViewFarFromBottom(false);
    clearExtendedLifecycleData(this.context.scene);

    // side effect clear
    destroyFileManager();
    this.destroyPlugins();
    this.clearInitSideEffect();
    this.loadMoreDispose();
  };

  public destroyFullSite = () => {
    this.destroy({ disableSkip: true });
  };

  /**
   * Request initialization data
   */
  private async requestInitData({
    onBefore,
    onAfter,
    onError,
  }: {
    onBefore?: () => void;
    onAfter?: () => void;
    onError?: () => void;
  }) {
    const ableToSkip = this.getIsSkipInit();
    if (ableToSkip) {
      return null;
    }

    onBefore?.();
    const currentRequestIndex = this.latestRequestIndex + 1;
    this.latestRequestIndex = currentRequestIndex;

    try {
      const result = await this.context.requestToInit();

      if (
        this.requestAborted ||
        currentRequestIndex < this.latestRequestIndex
      ) {
        return null;
      }

      this.loadMoreClient.clearMessageIndexStore();
      this.initStoreService.runCreateLifeCycle();
      return result;
    } catch (e) {
      console.error('init error', e);
      onError?.();

      const { error, meta } = getReportError(e);
      this.reporter.errorEvent({
        eventName: ReportEventNames.Init,
        error,
        meta: Object.assign({}, meta, {
          isPolicyException: getIsPolicyException(error),
        }),
      });
    }

    onAfter?.();
    return null;
  }

  /**
   * initialization process
   */
  private async processInit() {
    this.setInitStatus(InitStatus.Loading);

    this.requestAborted = false;

    // First try to get the initialization data.
    const requestData = await this.requestInitData({
      onError: () => {
        this.setInitStatus(InitStatus.Failed);
        this.context.eventCallback?.onInitError?.();
        this.lifeCycleService.app.onInitialError();
      },
    });

    // Determine whether there is empty data and do not process it.
    if (!requestData || this.requestAborted) {
      return;
    }

    this.loadMoreClient.handleInitialLoadIndex(requestData);

    this.recordUserAndBotInfo({ requestData });

    this.createAndRecordChatCore({ requestData });

    this.registerUploadPlugin();

    this.recordConversationParams({
      requestData,
    });

    this.setInitStatus(InitStatus.Success);
    this.context.eventCallback?.onInitSuccess?.();
    return requestData;
  }

  /**
   * Cancel request (not really cancelled in the strict sense, just cancelled from the data dimension)
   */
  public abortRequest = () => {
    this.requestAborted = true;
  };

  /**
   * Create and record ChatCore & create listeners
   */
  private createAndRecordChatCore({
    requestData,
  }: {
    requestData: MixInitResponse;
  }) {
    if (!requestData?.conversationId) {
      this.reporter.errorEvent({
        eventName: ReportEventNames.Init,
        error: new Error('Invalid Response without conversationId'),
      });

      this.setInitStatus(InitStatus.Failed);
      this.context.eventCallback?.onInitError?.();
      this.lifeCycleService.app.onInitialError();
      return;
    }

    const {
      useGlobalInitStore,
      useMessagesStore,
      useWaitingStore,
      useSuggestionsStore,
      useSectionIdStore,
    } = this.storeSet;

    const { setConversationId, setChatCore, setChatCoreOffListen } =
      useGlobalInitStore.getState();

    setConversationId(requestData.conversationId);

    const localeChatCore = new ChatCore({
      bot_version: requestData.botVersion,
      conversation_id: requestData.conversationId,
      space_id: this.context.spaceId,
      bot_id: this.context.botId,
      preset_bot: this.context.presetBot as PresetBot,
      draft_mode: this.context.scene === Scene.Playground,
      biz: this.mark,
      env: IS_DEV_MODE ? 'local' : IS_PROD ? 'production' : 'boe',
      deployVersion: IS_RELEASE_VERSION ? 'release' : 'inhouse',
      logLevel: IS_DEV_MODE ? 'info' : 'error',
      scene: this.context.scene,
      enableDebug: this.context.enableChatCoreDebug,
      ...this.context.createChatCoreOverrideConfig,
    });

    setChatCore(localeChatCore);
    setChatCoreOffListen(
      (() => {
        const securityStrategyContext = new SecurityStrategyContext({
          storeSet: this.storeSet,
          reporter: this.reporter,
          eventCallback: this.context.eventCallback,
          lifeCycleService: this.lifeCycleService,
          chatActionLockService: this.chatActionLockService,
        });

        return listenMessageUpdate({
          chatCore: localeChatCore,
          useMessagesStore,
          useWaitingStore,
          useSuggestionsStore,
          useSectionIdStore,
          reporter: this.reporter,
          eventCallback: this.context.eventCallback ?? {},
          configs: this.context.configs,
          securityStrategyContext,
          lifeCycleService: this.lifeCycleService,
        });
      })(),
    );
  }

  /**
   * Handling chat history, openers, SectionId and Suggestions
   */
  private recordConversationParams({
    requestData,
  }: {
    requestData: MixInitResponse;
  }) {
    const {
      useOnboardingStore,
      useMessagesStore,
      useSectionIdStore,
      useSuggestionsStore,
    } = this.storeSet;

    const { partialUpdateOnboardingData } = useOnboardingStore.getState();

    const { addMessages } = useMessagesStore.getState();

    const { setLatestSectionId } = useSectionIdStore.getState();

    const { lastSectionId, messageList, prologue, onboardingSuggestions } =
      requestData;

    setLatestSectionId(lastSectionId ?? '');

    const fixedMessageList = fixHistoryMessageList({
      historyMessageList: messageList ?? [],
      ignoreMessageConfigList: this.context.configs.ignoreMessageConfigList,
      reporter: this.reporter,
    });

    if (fixedMessageList) {
      addMessages(fixedMessageList, { clearFirst: true });
      const { idAndSuggestions } = splitMessageAndSuggestions(fixedMessageList);
      useSuggestionsStore.getState().updateSuggestionsBatch(idAndSuggestions);
    }

    partialUpdateOnboardingData(prologue, onboardingSuggestions);
  }

  /**
   * Initialize the upload plugin (note that it relies on Chat Core to initialize first)
   */
  public registerUploadPlugin = () => {
    const { chatCore } = this.storeSet.useGlobalInitStore.getState();
    if (!this.context.userInfo?.id || !chatCore) {
      console.error('UserId is Empty or Chat Core not Ready');
      return;
    }

    const uploadPluginName = 'upload-plugin';

    if (chatCore.checkPluginIsRegistered(uploadPluginName)) {
      return;
    }

    chatCore.registerPlugin(
      uploadPluginName,
      this.context.configs.uploadPlugin,
      {
        userId: this.context.userInfo.id,
        appId: APP_ID,
      },
    );
  };

  /**
   * Record user information and bot information
   */
  public recordUserAndBotInfo = ({
    requestData,
  }: {
    requestData: MixInitResponse;
  }) => {
    const { useSenderInfoStore, useOnboardingStore } = this.storeSet;

    const { userInfoMap, botInfoMap } = requestData;
    const { setUserInfoMap, setBotInfoMap, updateUserInfo } =
      useSenderInfoStore.getState();
    const { recordBotInfo } = useOnboardingStore.getState();

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
      return;
    }

    if (this.context.userInfo) {
      const defaultUserInfoMap = {
        [`${this.context.userInfo.id}`]: this.context.userInfo,
      };

      setUserInfoMap(defaultUserInfoMap);
      updateUserInfo(this.context.userInfo);
    }
  };

  /**
   * Set the initialization state and sync to the Store
   */
  private setInitStatus(initStatus: InitStatus) {
    const { setInitStatus } = this.storeSet.useGlobalInitStore.getState();

    setInitStatus(initStatus);
  }

  /**
   * Can I skip the initialization/destruction phase?
   */
  private getIsSkipInit() {
    const initSuccess =
      this.storeSet?.useGlobalInitStore.getState().initStatus ===
      InitStatus.Success;
    const ableToSkipInit = this.context.extendDataLifecycle === 'full-site';
    return initSuccess && ableToSkipInit;
  }
}
