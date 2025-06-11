import {
  bindContributions,
  definePluginCreator,
  type PluginCreator,
  CommandContribution,
} from '@coze-project-ide/client';

import { CloseConfirmContribution } from './close-confirm-contribution';

export const createCloseConfirmPlugin: PluginCreator<void> =
  definePluginCreator({
    onBind: ({ bind }) => {
      bindContributions(bind, CloseConfirmContribution, [CommandContribution]);
    },
  });
