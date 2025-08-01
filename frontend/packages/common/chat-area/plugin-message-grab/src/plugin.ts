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
