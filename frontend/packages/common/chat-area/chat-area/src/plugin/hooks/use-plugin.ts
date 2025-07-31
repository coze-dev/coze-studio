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

import { useShallow } from 'zustand/react/shallow';

import { isWriteablePlugin } from '../utils/is-writeable-plugin';
import { isReadonlyPlugin } from '../utils/is-readonly-plugin';
import { usePluginScopeContext } from '../context/plugin-scope-context';
import { type PluginName } from '../constants/plugin';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';

export const useWriteablePlugin = <T = unknown>(pluginName?: PluginName) => {
  const { usePluginStore } = useChatAreaStoreSet();

  const { pluginName: builtinPluginName } = usePluginScopeContext();

  const targetPlugin = usePluginStore(
    useShallow(state =>
      state.pluginInstanceList.find(
        plugin => plugin.pluginName === (pluginName ?? builtinPluginName),
      ),
    ),
  );

  if (!targetPlugin) {
    throw Error('cannot find target plugin');
  }

  if (isWriteablePlugin<T>(targetPlugin)) {
    return targetPlugin;
  }

  throw Error(
    `cannot find target writeable plugin, please confirm ${pluginName} is writeable mode plugin`,
  );
};

export const useReadonlyPlugin = <T = unknown>(pluginName?: PluginName) => {
  const { usePluginStore } = useChatAreaStoreSet();

  const { pluginName: builtinPluginName } = usePluginScopeContext();

  const targetPlugin = usePluginStore(
    useShallow(state =>
      state.pluginInstanceList.find(
        plugin => plugin.pluginName === (pluginName ?? builtinPluginName),
      ),
    ),
  );

  if (!targetPlugin) {
    throw Error('cannot find target plugin');
  }

  if (isReadonlyPlugin<T>(targetPlugin)) {
    return targetPlugin;
  }

  throw Error(
    `cannot find target readonly plugin, please confirm ${pluginName} is readonly mode plugin`,
  );
};
