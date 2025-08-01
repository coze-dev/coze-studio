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

/**
 * @module @coze-common/chat-core
 * Expose all external interfaces
 */
import EventEmitter from 'eventemitter3';
import { type InternalAxiosRequestConfig } from 'axios';

import { type DeployVersion, type ENV } from '@/shared/const';
import { type RequestManagerOptions } from '@/request-manager/types';
import { RequestManager } from '@/request-manager';
import { ReportLog } from '@/report-log';
import { type EventPayloadMaps } from '@/plugins/upload-plugin/types/plugin-upload';
import {
  type GetHistoryMessageResponse,
  type ClearMessageContextParams,
} from '@/message/types/message-manager';
import {
  type CreateMessageOptions,
  type FileMessageProps,
  type ImageMessageProps,
  type NormalizedMessageProps,
  type SendMessageOptions,
} from '@/message/types';
import { PreSendLocalMessageEventsManager } from '@/message/presend-local-message/presend-local-message-events-manager';
import { MessageManager } from '@/message/message-manager';
import { ChunkProcessor, PreSendLocalMessageFactory } from '@/message';
import { HttpChunk } from '@/channel/http-chunk';

import { type TokenManager } from '../credential';
import {
  type ChatASRParams,
  type BreakMessageParams,
  type DeleteMessageParams,
  type GetHistoryMessageParams,
  type ReportMessageParams,
} from './types/services/message-manager-service';
import { isPresetBotUnique, SdkEventsEnum } from './types/interface';
import type {
  Biz,
  BotUnique,
  CreateProps,
  LogLevel,
  Message,
  PluginKey,
  PluginValue,
  PresetBot,
  Scene,
  SdkEventsCallbackMap,
  ContentType,
} from './types/interface';
import { SendMessageService } from './services/send-message-service';
import { PluginsService } from './services/plugins-service';
import { MessageManagerService } from './services/message-manager-service';
import { HttpChunkService } from './services/http-chunk-service';
import { CreateMessageService } from './services/create-message-service';
import { ReportEventsTracer, SlardarEvents } from './events/slardar-events';

export default class ChatSDK {
  private static instances: Map<string, ChatSDK> = new Map();
  /**
   *  Pre-send Message Factory: Create pre-send messages for use on the screen
   */
  private preSendLocalMessageFactory!: PreSendLocalMessageFactory;

  /**
   * Process received chunk messages into a unified message format
   */
  private chunkProcessor!: ChunkProcessor;

  private messageManager!: MessageManager;

  /**
   * Streaming
   */
  private httpChunk!: HttpChunk;

  private reportLog!: ReportLog;

  private reportLogWithScope!: ReportLog;

  private requestManager!: RequestManager;

  /**
   * Maintain local message sending events:
   */

  private preSendLocalMessageEventsManager!: PreSendLocalMessageEventsManager;

  static EVENTS = SdkEventsEnum;

  biz!: Biz;

  bot_id!: string;

  space_id?: string;

  preset_bot!: PresetBot;

  /**
   * The current chat-core life cycle takes a bot_id and user as dimensions
   * If one user is supported for multiple conversation_id, it needs to be adjusted
   */
  user!: string;

  scene?: Scene;

  /**
   * usage environment
   */
  env!: ENV;

  deployVersion!: DeployVersion;

  bot_version?: string;

  draft_mode?: boolean;

  conversation_id!: string;

  enableDebug?: boolean;

  logLevel?: LogLevel;

  tokenManager?: TokenManager;

  private requestManagerOptions?: RequestManagerOptions;

  private eventBus: EventEmitter<SdkEventsEnum> = new EventEmitter();

  private reportEventsTracer!: ReportEventsTracer;

  private sendMessageService!: SendMessageService;

  private createMessageService!: CreateMessageService;

  private messageManagerService!: MessageManagerService;

  private httpChunkService!: HttpChunkService;

  private pluginsService!: PluginsService;

  constructor(props: CreateProps) {
    /** Initialize construction parameters */
    this.initProps(props);
    this.initModules(props);
    this.initServices();
    this.onEvents();
    this.reportLogWithScope.slardarEvent({
      eventName: SlardarEvents.SDK_INIT,
      meta: props,
    });
  }

  /**
   * Create a chatBot instance
   *1. For the same bot_id/preset_bot, repeated calls, sdk will only create one instance
   *2. Multiple bot_id/presetBot, corresponding to multiple SDK instances, maintaining its own events
   */
  static create(props: CreateProps) {
    const { unique_key } = ChatSDK.getUniqueKey(props);
    // For the same bot_id/preset_bot, repeated calls, create will only create one instance
    if (ChatSDK.instances.has(unique_key)) {
      console.error('duplicate chat core instance error');
      return ChatSDK.instances.get(unique_key);
    }

    const instance = new ChatSDK(props);
    ChatSDK.instances.set(unique_key, instance);
    return instance;
  }

  /**
   *  Get sdk unique key preset_bot > bot_id
   * @param props
   * @returns
   */
  static getUniqueKey(props: BotUnique): {
    unique_key: string;
    bot_id: string;
    preset_bot: PresetBot;
  } {
    if (isPresetBotUnique(props)) {
      return {
        unique_key: props.preset_bot,
        bot_id: '',
        preset_bot: props.preset_bot,
      };
    }

    return {
      unique_key: props.bot_id,
      bot_id: props.bot_id,
      preset_bot: '',
    };
  }

  private initProps(props: CreateProps) {
    const { bot_id, preset_bot } = ChatSDK.getUniqueKey(props);
    const {
      enableDebug,
      logLevel,
      conversation_id,
      biz,
      user,
      env,
      deployVersion,
      scene,
      bot_version,
      draft_mode,
      space_id,
    } = props;
    this.bot_id = bot_id;
    this.space_id = space_id;
    this.preset_bot = preset_bot;
    this.conversation_id = conversation_id;
    this.biz = biz;
    this.enableDebug = enableDebug || false;
    this.logLevel = logLevel || 'error';
    this.user = user || '';
    this.env = env;
    this.deployVersion = deployVersion;
    this.scene = scene;
    this.bot_version = bot_version;
    this.draft_mode = draft_mode;
  }

  /** Initializing Dependency Module Instances */
  private initModules(props: CreateProps) {
    this.initReportLog();
    this.reportEventsTracer = new ReportEventsTracer(this.reportLogWithScope);
    this.initRequestManager(props);
    this.initTokenManager(this.requestManager, props);
    this.preSendLocalMessageEventsManager =
      new PreSendLocalMessageEventsManager({
        reportLog: this.reportLog,
      });
    /** Initialize the pre-sent message factory */
    this.preSendLocalMessageFactory = new PreSendLocalMessageFactory({
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
      conversation_id: this.conversation_id,
      user: this.user,
      scene: this.scene,
      bot_version: this.bot_version,
      draft_mode: this.draft_mode,
    });
    /** Initialize processing of received chunk messages into a unified message format */
    this.chunkProcessor = new ChunkProcessor({
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
      enableDebug: this.enableDebug,
    });
    this.httpChunk = new HttpChunk({
      tokenManager: props.tokenManager,
      requestManager: this.requestManager,
      reportLogWithScope: this.reportLogWithScope,
    });
    /**
     * Initialize the message manager: message deletion/history, etc
     */
    this.messageManager = new MessageManager({
      reportLog: this.reportLog,
      requestManager: this.requestManager,
    });
  }

  private onEvents() {
    this.httpChunkService.onHttpChunkEvents();
  }

  private initServices() {
    this.pluginsService = new PluginsService();
    this.createMessageService = new CreateMessageService({
      preSendLocalMessageFactory: this.preSendLocalMessageFactory,
      preSendLocalMessageEventsManager: this.preSendLocalMessageEventsManager,
      reportLogWithScope: this.reportLogWithScope,
      pluginsService: this.pluginsService,
    });
    this.sendMessageService = new SendMessageService({
      preSendLocalMessageFactory: this.preSendLocalMessageFactory,
      httpChunk: this.httpChunk,
      preSendLocalMessageEventsManager: this.preSendLocalMessageEventsManager,
      reportLogWithScope: this.reportLogWithScope,
      reportEventsTracer: this.reportEventsTracer,
    });
    this.messageManagerService = new MessageManagerService({
      messageManager: this.messageManager,
      conversation_id: this.conversation_id,
      scene: this.scene,
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
      draft_mode: this.draft_mode,
      httpChunk: this.httpChunk,
      chunkProcessor: this.chunkProcessor,
      reportEventsTracer: this.reportEventsTracer,
      reportLogWithScope: this.reportLogWithScope,
    });
    this.httpChunkService = new HttpChunkService({
      httpChunk: this.httpChunk,
      reportLogWithScope: this.reportLogWithScope,
      chunkProcessor: this.chunkProcessor,
      preSendLocalMessageEventsManager: this.preSendLocalMessageEventsManager,
      chatSdkEventEmit: this.emit.bind(this),
      chatSdkEventBus: this.eventBus,
      reportEventsTracer: this.reportEventsTracer,
    });
  }

  private initReportLog() {
    this.reportLog = new ReportLog({
      logLevel: this.logLevel,
      env: this.env,
      deployVersion: this.deployVersion,
      meta: {
        biz: this.biz,
        chatCoreVersion: '1.1.0',
      },
    });
    this.reportLog.init();
    this.reportLogWithScope = this.reportLog.createLoggerWith({
      scope: 'chat-sdk',
    });
  }

  private initTokenManager(requestManager: RequestManager, props: CreateProps) {
    this.tokenManager = props.tokenManager;

    if (!this.tokenManager) {
      return;
    }
    const tokenManagerRequestHook = (config: InternalAxiosRequestConfig) => {
      if (!this.tokenManager) {
        return config;
      }
      const apiKeyAuthValue = this.tokenManager.getApiKeyAuthorizationValue();
      if (apiKeyAuthValue) {
        config.headers.set('Authorization', apiKeyAuthValue);
      }
      return config;
    };
    const options: RequestManagerOptions = {
      hooks: {
        onBeforeRequest: [tokenManagerRequestHook],
      },
    };
    requestManager.appendRequestOptions(options);
  }

  private initRequestManager(props: CreateProps) {
    this.requestManagerOptions = props.requestManagerOptions;
    this.requestManager = new RequestManager({
      options: this.requestManagerOptions,
      reportLog: this.reportLog,
    });
  }

  /**
   * Destroy the SDK instance.
   * Clear all listening events
   */
  destroy() {
    // Clear all htpChunk listening events
    this.httpChunk.drop();
    // Clear sdk time
    this.eventBus.removeAllListeners();
    // Clear all cached chunks
    this.chunkProcessor.streamBuffer.clearMessageBuffer();
    // Clear the corresponding instance
    const { unique_key } = ChatSDK.getUniqueKey({
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
    });
    ChatSDK.instances.delete(unique_key);
    // Clear pre-sent message cache
    this.preSendLocalMessageEventsManager.destroy();
    this.reportLogWithScope.info({
      message: 'SDK销毁',
    });
  }

  /**
   * Monitor sdk events
   */
  on<T extends SdkEventsEnum>(event: T, fn: SdkEventsCallbackMap[T]) {
    // Repeated listening, error message
    if (this.eventBus.eventNames().includes(event)) {
      this.reportLogWithScope.slardarError({
        message: '重复监听事件',
        error: new Error('重复监听'),
        meta: {
          event,
        },
      });
    }
    this.eventBus.on(event, fn);

    return () => {
      this.eventBus.off(event, fn);
    };
  }

  off<T extends SdkEventsEnum>(event: T, fn: SdkEventsCallbackMap[T]) {
    this.eventBus.off(event, fn);
  }

  private emit<T extends SdkEventsEnum>(
    event: T,
    ...args: Parameters<SdkEventsCallbackMap[T]>
  ) {
    this.eventBus.emit(event, ...args);
  }

  createTextMessage(
    ...args: Parameters<CreateMessageService['createTextMessage']>
  ) {
    return this.createMessageService.createTextMessage(...args);
  }

  createImageMessage<M extends EventPayloadMaps = EventPayloadMaps>(
    props: ImageMessageProps<M>,
    options?: CreateMessageOptions,
  ) {
    return this.createMessageService.createImageMessage(props, options);
  }

  createFileMessage<M extends EventPayloadMaps = EventPayloadMaps>(
    props: FileMessageProps<M>,
    options?: CreateMessageOptions,
  ) {
    return this.createMessageService.createFileMessage<M>(props, options);
  }

  createTextAndFileMixMessage(
    ...args: Parameters<CreateMessageService['createTextAndFileMixMessage']>
  ) {
    return this.createMessageService.createTextAndFileMixMessage(...args);
  }

  createNormalizedPayloadMessage<T extends ContentType>(
    props: NormalizedMessageProps<T>,
    options?: CreateMessageOptions,
  ): Message<T> {
    return this.createMessageService.createNormalizedPayloadMessage(
      props,
      options,
    );
  }

  resumeMessage(message: Message<ContentType>, options?: SendMessageOptions) {
    return this.sendMessageService.resumeMessage(message, options);
  }

  sendMessage(
    message: Message<ContentType>,
    options?: SendMessageOptions,
  ): Promise<Message<ContentType>> {
    return this.sendMessageService.sendMessage(message, options);
  }

  registerPlugin<T extends PluginKey, P extends Record<string, unknown>>(
    key: T,
    plugin: PluginValue<T, P>,
    constructorOptions?: P,
  ) {
    this.pluginsService.registerPlugin(key, plugin, constructorOptions);
  }

  checkPluginIsRegistered(key: PluginKey): boolean {
    return this.pluginsService.checkPluginIsRegistered(key);
  }

  getRegisteredPlugin(key: PluginKey) {
    return this.pluginsService.getRegisteredPlugin(key);
  }

  getHistoryMessage(params: GetHistoryMessageParams) {
    return this.messageManagerService.getHistoryMessage(params);
  }

  static convertMessageList = (
    data: GetHistoryMessageResponse['message_list'],
  ) => MessageManager.convertMessageList(data);

  clearMessageContext(params: ClearMessageContextParams) {
    return this.messageManagerService.clearMessageContext(params);
  }

  clearHistory() {
    return this.messageManagerService.clearHistory();
  }

  deleteMessage(params: DeleteMessageParams) {
    return this.messageManagerService.deleteMessage(params);
  }

  reportMessage(params: ReportMessageParams) {
    return this.messageManagerService.reportMessage(params);
  }

  breakMessage(params: BreakMessageParams) {
    return this.messageManagerService.breakMessage(params);
  }

  chatASR(params: ChatASRParams) {
    if (this.space_id) {
      params.append('space_id', this.space_id);
    }
    return this.messageManagerService.chatASR(params);
  }
}
