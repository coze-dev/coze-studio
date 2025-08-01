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
