import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

export const useDraftBotPluginById = (pluginId?: string) => {
  const {
    storeSet: { useDraftBotPluginsStore },
  } = useBotEditor();
  return useDraftBotPluginsStore(store =>
    pluginId ? store.pluginsMap[pluginId] : undefined,
  );
};

export const useBatchLoadDraftBotPlugins = () => {
  const {
    storeSet: { useDraftBotPluginsStore },
  } = useBotEditor();
  return useDraftBotPluginsStore(store => store.batchLoad);
};
