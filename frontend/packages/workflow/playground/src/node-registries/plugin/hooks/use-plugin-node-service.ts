import { useService } from '@flowgram-adapter/free-layout-editor';

import { PluginNodeService, type PluginNodeStore } from '@/services';

export const usePluginNodeService = () =>
  useService<PluginNodeService>(PluginNodeService);

export const usePluginNodeServiceStore = <T>(
  selector: (s: PluginNodeStore) => T,
) => {
  const pluginService = usePluginNodeService();

  return pluginService.store(selector);
};
