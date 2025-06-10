import {
  PluginMode,
  PluginName,
  ReadonlyChatAreaPlugin,
  createCustomComponents,
  createReadonlyLifeCycleServices,
  type ReadonlyLifeCycleServiceGenerator,
} from '@coze-common/chat-area';

import { type BackgroundPluginBizContext } from './types/biz-context';
import { bizAppLifeCycleService } from './services/life-cycle/app';
import { ChatBackgroundUI } from './custom-components/chat-background-ui';

export const bizLifeCycleServiceGenerator: ReadonlyLifeCycleServiceGenerator<
  BackgroundPluginBizContext
> = plugin => ({
  appLifeCycleService: bizAppLifeCycleService(plugin),
});

export class BizPlugin extends ReadonlyChatAreaPlugin<BackgroundPluginBizContext> {
  public pluginMode = PluginMode.Readonly;

  public pluginName = PluginName.ChatBackground;

  public lifeCycleServices = createReadonlyLifeCycleServices(
    this,
    bizLifeCycleServiceGenerator,
  );

  public customComponents = createCustomComponents({
    MessageListFloatSlot: ChatBackgroundUI,
  });
}
