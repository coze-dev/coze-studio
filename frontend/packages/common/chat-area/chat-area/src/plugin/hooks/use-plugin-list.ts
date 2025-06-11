import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';

export const usePluginList = () => {
  const { usePluginStore } = useChatAreaStoreSet();

  const pluginList = usePluginStore(
    useShallow(state => state.pluginInstanceList),
  );

  return pluginList;
};
