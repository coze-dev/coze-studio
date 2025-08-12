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

import { type ChatAreaPlugin } from '../plugin';
import { type PluginMode } from '../../constants/plugin';

export abstract class LifeCycleService<
  U extends PluginMode = PluginMode.Readonly,
  T = unknown,
  K = unknown,
> {
  public pluginInstance: ChatAreaPlugin<U, T, K>;

  constructor(plugin: ChatAreaPlugin<U, T, K>) {
    this.pluginInstance = plugin;
  }
}

export abstract class ReadonlyLifeCycleService<
  T = unknown,
  K = unknown,
> extends LifeCycleService<PluginMode.Readonly, T, K> {}

export abstract class WriteableLifeCycleService<
  T = unknown,
  K = unknown,
> extends LifeCycleService<PluginMode.Writeable, T, K> {}
