import { type PluginRegistryEntry } from '@coze-common/chat-area';

import { ResumePlugin } from './plugin';

export const ResumePluginRegistry: PluginRegistryEntry<unknown> = {
  createPluginBizContext() {
    return;
  },
  Plugin: ResumePlugin,
};
