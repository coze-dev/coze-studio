import { definePluginCreator } from '@coze-project-ide/core';

import { ContextMenuContainerModule } from './context-menu-container-module';

export const createContextMenuPlugin = definePluginCreator<void>({
  containerModules: [ContextMenuContainerModule],
});
