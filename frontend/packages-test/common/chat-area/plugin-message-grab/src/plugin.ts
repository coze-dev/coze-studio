import {
  PluginMode,
  PluginName,
  WriteableChatAreaPlugin,
  createCustomComponents,
} from '@coze-common/chat-area';

import { type GrabPublicMethod } from './types/public-methods';
import { type GrabPluginBizContext } from './types/plugin-biz-context';
import { GrabMessageLifeCycleService } from './services/life-cycle/message';
import { GrabCommandLifeCycleService } from './services/life-cycle/command';
import { GrabAppLifeCycleService } from './services/life-cycle/app';
import { MessageListFloat } from './custom-components/message-list-float-slot';
import { QuoteMessageInnerTopSlot } from './custom-components/message-inner-top-slot';
import { QuoteInputAddonTop } from './custom-components/input-addon-top';

export class ChatAreaGrabPlugin extends WriteableChatAreaPlugin<
  GrabPluginBizContext,
  GrabPublicMethod
> {
  public pluginMode = PluginMode.Writeable;
  public pluginName = PluginName.MessageGrab;

  public customComponents = createCustomComponents({
    MessageListFloatSlot: MessageListFloat,
    TextMessageInnerTopSlot: QuoteMessageInnerTopSlot,
    InputAddonTop: QuoteInputAddonTop,
  });

  public lifeCycleServices = {
    appLifeCycleService: new GrabAppLifeCycleService(this),
    messageLifeCycleService: new GrabMessageLifeCycleService(this),
    commandLifeCycleService: new GrabCommandLifeCycleService(this),
  };

  public publicMethods: GrabPublicMethod = {
    updateEnableGrab: (enable: boolean) => {
      if (!this.pluginBizContext) {
        return;
      }

      const { updateEnableGrab } =
        this.pluginBizContext.storeSet.usePreferenceStore.getState();

      updateEnableGrab(enable);
    },
  };
}
