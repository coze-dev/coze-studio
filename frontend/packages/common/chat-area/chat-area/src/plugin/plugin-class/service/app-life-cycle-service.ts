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
 
import {
  type SdkMessageEvent,
  type SdkPullingStatusEvent,
} from '@coze-common/chat-core';

import {
  type OnRefreshMessageListError,
  type OnAfterCallback,
  type OnAfterInitialContext,
} from '../../types/plugin-class/app-life-cycle';
import {
  ReadonlyLifeCycleService,
  WriteableLifeCycleService,
} from './life-cycle-service';

export interface OnBeforeListenChatCoreParam {
  onMessageUpdate: (evt: SdkMessageEvent) => void;
  onMessageStatusChange: (evt: SdkPullingStatusEvent) => void;
}

type OnBeforeListenChatCore = (
  ctx: OnBeforeListenChatCoreParam,
) => { abortListen: boolean } | undefined;

/**
 * ! 希望你注意到生命周期的上下文信息都放在ctx中
 * ! 如果判断只是上下文，请你注意收敛到ctx中，请勿增加新的参数
 * ! CodeReview的时候辛苦也注重一下这里
 */
export abstract class ReadonlyAppLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * PluginStore初始化后
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onAfterCreateStores?(stores: OnAfterCallback): void;
  /**
   * ChatArea初始化之前（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onBeforeInitial?(): void;
  /**
   * ChatArea初始化之后（成功）（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onAfterInitial?(ctx: OnAfterInitialContext): void;
  /**
   * ChatArea初始化失败（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onInitialError?(): void;
  /**
   * ChatArea销毁之前（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onBeforeDestroy?(): void;
  /**
   * 刷新消息列表前
   */
  onBeforeRefreshMessageList?(): void;
  /**
   * 刷新消息列表后
   */
  onAfterRefreshMessageList?(): void;
  /**
   * 刷新消息列表失败
   */
  onRefreshMessageListError?(ctx: OnRefreshMessageListError): void;
  onBeforeListenChatCore?: OnBeforeListenChatCore;
}

export abstract class WriteableAppLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * PluginStore初始化后
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onAfterCreateStores?(stores: OnAfterCallback): void;
  /**
   * ChatArea初始化之前（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onBeforeInitial?(): void;
  /**
   * ChatArea初始化之后（成功）（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onAfterInitial?(ctx: OnAfterInitialContext): void;
  /**
   * ChatArea初始化失败（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onInitialError?(): void;
  /**
   * ChatArea销毁之前（暂时不支持异步调用，在Hooks中）
   * 后续需要支持的话，写法为 void | Promise<void>
   */
  onBeforeDestroy?(): void;
  /**
   * 刷新消息列表前
   */
  onBeforeRefreshMessageList?(): void;
  /**
   * 刷新消息列表后
   */
  onAfterRefreshMessageList?(): void;
  /**
   * 刷新消息列表失败
   */
  onRefreshMessageListError?(ctx: OnRefreshMessageListError): void;
  onBeforeListenChatCore?: OnBeforeListenChatCore;
}
