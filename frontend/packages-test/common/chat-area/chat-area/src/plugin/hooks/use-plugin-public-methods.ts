import { useShallow } from 'zustand/react/shallow';

import { type PluginName } from '../constants/plugin';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';

export const usePluginPublicMethods = <T = unknown>(pluginName: PluginName) => {
  const { usePluginStore } = useChatAreaStoreSet();

  const targetPlugin = usePluginStore(
    useShallow(state =>
      state.pluginInstanceList.find(plugin => plugin.pluginName === pluginName),
    ),
  );

  if (!targetPlugin) {
    return null;
  }

  return targetPlugin.publicMethods as T;
};
