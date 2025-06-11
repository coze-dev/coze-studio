import {
  definePluginCreator,
  type PluginCreator,
  bindContributions,
  CommandContribution,
  ShortcutsContribution,
} from '@coze-project-ide/framework';

import { CustomResourceFolderShortcutService } from './shortcut-service';
import { ResourceFolderContribution } from './resource-folder-contribution';
export { CustomResourceFolderShortcutService };
export const createResourceFolderPlugin: PluginCreator<void> =
  definePluginCreator({
    onBind({ bind }) {
      bind(CustomResourceFolderShortcutService).toSelf().inSingletonScope();
      bindContributions(bind, ResourceFolderContribution, [
        CommandContribution,
        ShortcutsContribution,
      ]);
    },
  });
