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
  type CreateChatAreaPluginContextParams,
  createChatAreaPluginContext,
} from '../plugin/plugin-context';
import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin/plugin-class/plugin';
import { type ChatAreaProviderProps } from '../context/chat-area-context/type';

interface InitPluginsProps {
  pluginRegistryList: ChatAreaProviderProps['pluginRegistryList'];
}

export const initPlugins = (
  params: InitPluginsProps & CreateChatAreaPluginContextParams,
) => {
  const {
    pluginRegistryList = [],
    storeSet,
    refreshMessageList,
    reporter,
    eventCallback,
    lifeCycleService,
    getCommonDeps,
  } = params;

  /**
   * Plugin registration starts
   */
  const pluginInstanceList: (
    | ReadonlyChatAreaPlugin<object>
    | WriteableChatAreaPlugin<object>
  )[] = [];

  for (const registerPlugin of pluginRegistryList) {
    if (
      !registerPlugin ||
      !registerPlugin.createPluginBizContext ||
      !registerPlugin.Plugin
    ) {
      console.error('register plugin has params empty!');
      continue;
    }

    // Create business context
    const pluginBizContext = registerPlugin.createPluginBizContext();

    // Create a built-in context for chat-area
    const chatAreaPluginContext = createChatAreaPluginContext({
      storeSet,
      refreshMessageList,
      reporter,
      eventCallback,
      lifeCycleService,
      getCommonDeps,
    });

    // Initialize the business plug-in instance
    const pluginInstance = new registerPlugin.Plugin(
      pluginBizContext,
      chatAreaPluginContext,
    );

    pluginInstanceList.push(pluginInstance);
  }
  const { usePluginStore } = storeSet;
  usePluginStore.getState().setPluginInstanceList(pluginInstanceList);
  /**
   * Plugin registration ends
   */

  return () => {
    usePluginStore.getState().offAllSubscription();
  };
};
