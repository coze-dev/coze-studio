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
 
import { exhaustiveCheckForRecord } from '@coze-common/chat-area-utils';

import {
  type ReadonlyLifeCycleServiceGenerator,
  type WriteableLifeCycleServiceGenerator,
} from '../types/utils/create-life-cycle-service';
import {
  type ReadonlyLifeCycleServiceCollection,
  type WriteableLifeCycleServiceCollection,
} from '../types/plugin-class/life-cycle';
import {
  type WriteableChatAreaPlugin,
  type ReadonlyChatAreaPlugin,
} from '../plugin-class/plugin';

/**
 * 创建 可写生命周期 的辅助函数
 */
export const createWriteableLifeCycleServices = <T = unknown, K = unknown>(
  plugin: WriteableChatAreaPlugin<T, K>,
  generator: WriteableLifeCycleServiceGenerator<T, K>,
): WriteableLifeCycleServiceCollection<T, K> => {
  const lifeCycleService = generator(plugin);

  // 为了不影响历史逻辑，返回值会过滤掉 pluginInstance 属性
  bindPluginInstance<T, K>(
    lifeCycleService as unknown as WriteableLifeCycleServiceCollection<T, K>,
    plugin,
  );

  return lifeCycleService as unknown as WriteableLifeCycleServiceCollection<
    T,
    K
  >;
};

/**
 * 创建 可写生命周期 的辅助函数
 */
export const createReadonlyLifeCycleServices = <T = unknown, K = unknown>(
  plugin: ReadonlyChatAreaPlugin<T, K>,
  generator: ReadonlyLifeCycleServiceGenerator<T, K>,
): ReadonlyLifeCycleServiceCollection<T, K> => {
  const lifeCycleService = generator(plugin);

  // 为了不影响历史逻辑，返回值会过滤掉 pluginInstance 属性
  bindPluginInstance<T, K>(
    lifeCycleService as unknown as ReadonlyLifeCycleServiceCollection<T, K>,
    plugin,
  );

  return lifeCycleService as unknown as ReadonlyLifeCycleServiceCollection<
    T,
    K
  >;
};

/**
 * 针对历史逻辑的适配，支持通过 pluginInstance 继续访问数据
 */
const bindPluginInstance = <T = unknown, K = unknown>(
  lifeCycleService:
    | ReadonlyLifeCycleServiceCollection<T, K, false>
    | WriteableLifeCycleServiceCollection<T, K, false>,
  plugin: ReadonlyChatAreaPlugin<T, K> | WriteableChatAreaPlugin<T, K>,
) => {
  const {
    appLifeCycleService,
    messageLifeCycleService,
    commandLifeCycleService,
    renderLifeCycleService,
    ...rest
  } = lifeCycleService;
  exhaustiveCheckForRecord(rest);

  if (appLifeCycleService) {
    appLifeCycleService.pluginInstance = plugin;
  }

  if (messageLifeCycleService) {
    messageLifeCycleService.pluginInstance = plugin;
  }

  if (commandLifeCycleService) {
    commandLifeCycleService.pluginInstance = plugin;
  }

  if (renderLifeCycleService) {
    renderLifeCycleService.pluginInstance = plugin;
  }
};
