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
  createWriteableLifeCycleServices,
} from '@coze-common/chat-area';

import { type PluginBizContext } from './types/biz-context';
import { bizLifeCycleServiceGenerator } from './services/life-cycle';

export class BizPlugin extends WriteableChatAreaPlugin<PluginBizContext> {
  /**
   * plugin type
   * PluginMode. Readonly = read-only mode
   * PluginMode. Writeable = Writable Mode
   */
  public pluginMode = PluginMode.Writeable;
  /**
   * plugin name
   * Please click PluginName to define it.
   */
  public pluginName = PluginName.DebugCommon;

  /**
   * lifecycle services
   */
  public lifeCycleServices = createWriteableLifeCycleServices(
    this,
    bizLifeCycleServiceGenerator,
  );
}
