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
