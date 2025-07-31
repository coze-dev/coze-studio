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
 * ! Hope you noticed that the context information for the lifecycle is placed in ctx
 * ! If the judgment is just context, please pay attention to the convergence into ctx and do not add new parameters
 * ! Please pay attention here when CodeReview.
 */
export abstract class ReadonlyAppLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * After PluginStore initialization
   * If you need support in the future, write it as void | Promise < void >
   */
  onAfterCreateStores?(stores: OnAfterCallback): void;
  /**
   * Before ChatArea is initialized (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onBeforeInitial?(): void;
  /**
   * After the ChatArea is initialized (successfully) (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onAfterInitial?(ctx: OnAfterInitialContext): void;
  /**
   * ChatArea initialization failed (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onInitialError?(): void;
  /**
   * Before ChatArea is destroyed (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onBeforeDestroy?(): void;
  /**
   * Before refreshing the message list
   */
  onBeforeRefreshMessageList?(): void;
  /**
   * After refreshing the message list
   */
  onAfterRefreshMessageList?(): void;
  /**
   * Failed to refresh message list
   */
  onRefreshMessageListError?(ctx: OnRefreshMessageListError): void;
  onBeforeListenChatCore?: OnBeforeListenChatCore;
}

export abstract class WriteableAppLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * After PluginStore initialization
   * If you need support in the future, write it as void | Promise < void >
   */
  onAfterCreateStores?(stores: OnAfterCallback): void;
  /**
   * Before ChatArea is initialized (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onBeforeInitial?(): void;
  /**
   * After the ChatArea is initialized (successfully) (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onAfterInitial?(ctx: OnAfterInitialContext): void;
  /**
   * ChatArea initialization failed (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onInitialError?(): void;
  /**
   * Before ChatArea is destroyed (asynchronous calls are temporarily not supported, in Hooks)
   * If you need support in the future, write it as void | Promise < void >
   */
  onBeforeDestroy?(): void;
  /**
   * Before refreshing the message list
   */
  onBeforeRefreshMessageList?(): void;
  /**
   * After refreshing the message list
   */
  onAfterRefreshMessageList?(): void;
  /**
   * Failed to refresh message list
   */
  onRefreshMessageListError?(ctx: OnRefreshMessageListError): void;
  onBeforeListenChatCore?: OnBeforeListenChatCore;
}
