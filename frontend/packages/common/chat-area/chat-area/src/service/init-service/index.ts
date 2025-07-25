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
   * 当前使用的上下文信息
   */
  private context: InitContext;
  /**
   * 存储下一轮可供使用的上下文信息（重新初始化）
   */
  private nextContext: InitContext | null = null;
  /**
   * 是否取消请求标志位
   */
  private requestAborted = false;
  /**
   * store mark 信息
   */
  private mark!: Biz;
  /**
   * 前置初始化 Store 服务
   */
  private preInitStoreService!: PreInitStoreService;
  /**
   * Store 服务
   */
  private initStoreService!: InitStoreService;
  /**
   * 加载更多取消监听事件
   */
  private loadMoreDispose!: () => void;
  /**
   * 销毁插件事件
   */
  private destroyPlugins!: () => void;

  /**
   * reporter
   */
  public reporter!: Reporter;
  /**
   * 生命周期服务
   */
  public lifeCycleService!: SystemLifeCycleService;
  /**
   * 锁服务
   */
  public chatActionLockService!: ChatActionLockService;
  /**
   * 事件中心
   */
  public eventCenter: Emitter<EventCenter> = mitt<EventCenter>();
  /**
   * 加载更多服务
   */
  public loadMoreClient!: LoadMoreClient;
  /**
   * 加载更多服务环境工具
   */
  public loadMoreEnvTools!: LoadMoreEnvTools;
  /**
   * Store Set 信息
   */
  public storeSet!: StoreSet;
  // ! 你要加属性了吗？请注意使用 ! 是明确的情况下，并且需要补充运行时检查到 assertInitialized 函数中

  /**
   * 构造方法
   */
  constructor(context: InitContext) {
    this.context = context;

    this.initServices();
    this.assertInitialized();

    // 创建 LoadMore 后执行定位到消息
    this.locateToUnreadMessage();
    this.init();
  }

  /**
   * 运行时判断初始化必备数据是否正确
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

    // 类型检查貌似写不出来-。- 不能获取 private 属性的数据，所以这里就不检查了

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
   * 初始化服务
   */
  private initServices() {
    this.mark = generateChatCoreBiz(this.context.scene);
    this.reporter = this.context.reporter.createReporterWithPreset({
      namespace: 'bot-platform',
    });

    // 创建前置 Store 初始化服务
    this.preInitStoreService = new PreInitStoreService({
      mark: this.mark,
      scene: this.context.scene,
      extendDataLifecycle: this.context.extendDataLifecycle,
      reporter: this.reporter,
    });

    // 创建系统生命周期服务
    this.lifeCycleService = new SystemLifeCycleService({
      reporter: this.reporter,
      usePluginStore:
        this.preInitStoreService.prePositionedStoreSet.usePluginStore,
    });

    // 创建普通 Store 初始化服务
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

    // 执行创建互斥锁
    this.chatActionLockService = this.createChatActionLockService();

    // 创建 LoadMore 服务
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
    // 注册插件系统
    this.destroyPlugins = initPlugins({
      pluginRegistryList: this.context.pluginRegistryList,
      storeSet: this.storeSet,
      refreshMessageList: this.refreshMessageList,
      eventCallback: this.context.eventCallback,
      reporter: this.reporter,
      lifeCycleService: this.lifeCycleService,
      getCommonDeps: () => commonDeps,
    });

    // 等待插件注册完毕后在执行相关生命周期
    this.initStoreService.runCreateLifeCycle();
    this.loadMoreClient = loadMoreClient;
    this.loadMoreDispose = loadMoreDispose;
    this.loadMoreEnvTools = loadMoreEnvTools;
  }

  /**
   * 动态更新 Context
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
   * 初始化主方法
   */
  public init = async () => {
    // 如果之前已经初始化成功了，就不在进行初始化了
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
   * @experimental 实验性质的功能，并未进行测试回归，使用时请重点测试
   * 刷新消息列表
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
   * 创建操作互斥锁服务
   */
  private createChatActionLockService() {
    // 创建 Action 互斥锁
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
   * 创建 LoadMore 服务
   */
  private createLoadMoreService() {
    const { useMessageIndexStore, useGlobalInitStore, useWaitingStore } =
      this.storeSet;

    const { listenProcessChatStateChange, forceDispose } =
      getListenProcessChatStateChange(this.storeSet.useWaitingStore);

    this.loadMoreDispose = forceDispose;

    const loadMoreEnv = (() => {
      // action 都是稳定引用，无需现场计算
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
        // 取值，需要运行时现场计算
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
   * 定位到未读消息
   */
  private locateToUnreadMessage() {
    this.loadMoreClient.locateToUnreadMessage({
      messages: this.storeSet.useMessagesStore.getState().messages,
      readIndex: this.storeSet.useMessageIndexStore.getState().readIndex,
    });
  }

  /**
   * 清除副作用的函数
   */
  private clearInitSideEffect() {
    this.initStoreService.clearStoreSet();
    this.preInitStoreService.clearStoreSet();
  }

  /**
   * 销毁 ChatArea
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
   * 请求初始化数据
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
   * 初始化过程
   */
  private async processInit() {
    this.setInitStatus(InitStatus.Loading);

    this.requestAborted = false;

    // 先去尝试获取初始化数据
    const requestData = await this.requestInitData({
      onError: () => {
        this.setInitStatus(InitStatus.Failed);
        this.context.eventCallback?.onInitError?.();
        this.lifeCycleService.app.onInitialError();
      },
    });

    // 判断是不是存在空数据则不进行处理了
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
   * 取消请求（严格意义上并没真正取消，只是从数据维度返回取消了）
   */
  public abortRequest = () => {
    this.requestAborted = true;
  };

  /**
   * 创建和记录 ChatCore & 创建监听
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
   * 处理记录历史消息、开场白、SectionId 和 Suggestions
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
   * 初始化上传插件（注意，依赖 Chat Core 先行初始化）
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
   * 记录用户信息和 Bot 信息
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

      // todo: remove 临时逻辑
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
   * 设置初始化状态并同步至 Store
   */
  private setInitStatus(initStatus: InitStatus) {
    const { setInitStatus } = this.storeSet.useGlobalInitStore.getState();

    setInitStatus(initStatus);
  }

  /**
   * 是否可以跳过初始化 / 销毁 阶段
   */
  private getIsSkipInit() {
    const initSuccess =
      this.storeSet?.useGlobalInitStore.getState().initStatus ===
      InitStatus.Success;
    const ableToSkipInit = this.context.extendDataLifecycle === 'full-site';
    return initSuccess && ableToSkipInit;
  }
}
