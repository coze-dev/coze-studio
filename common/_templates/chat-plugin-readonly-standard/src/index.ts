import { type PluginRegistryEntry } from '@coze-common/chat-area';

import { type PluginBizContext } from './types/biz-context';
import { BizPlugin } from './plugin';

// eslint-disable-next-line @typescript-eslint/naming-convention -- 插件命名大写开头符合预期
export const BizPluginRegistry: PluginRegistryEntry<PluginBizContext> = {
  /**
   * 贯穿插件生命周期、组件的上下文
   */
  createPluginBizContext() {
    return {};
  },
  /**
   * 插件本体
   */
  Plugin: BizPlugin,
};
