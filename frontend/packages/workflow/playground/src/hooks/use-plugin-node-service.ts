import { useService } from '@flowgram-adapter/free-layout-editor';

import {
  PluginNodeService,
  type PluginNodeStore,
} from '@/services/plugin-node-service';

export const usePluginNodeService = () =>
  useService<PluginNodeService>(PluginNodeService);

export const usePluginNodeStore = <T>(selector: (s: PluginNodeStore) => T) => {
  const pluginService = usePluginNodeService();
  return pluginService.store(selector);
};
