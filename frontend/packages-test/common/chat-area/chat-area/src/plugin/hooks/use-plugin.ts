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
