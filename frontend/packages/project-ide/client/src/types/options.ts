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

/* eslint-disable @typescript-eslint/no-namespace */
import { type interfaces } from 'inversify';
import { type AsClass } from '@flowgram-adapter/common';
import {
  type HistoryPluginOptions,
  HistoryService,
} from '@flowgram-adapter/common';
import { type ViewPluginOptions } from '@coze-project-ide/view';
import {
  type OpenHandler,
  type NavigationPluginOptions,
  type CommandPluginOptions,
  CommandService,
  type ShortcutsPluginOptions,
  ResourceService,
  type ResourcePluginOptions,
  type LabelPluginOptions,
  type PreferencesPluginOptions,
  type URI,
  type PluginContext,
  type Plugin,
  type LifecycleContribution,
} from '@coze-project-ide/core';

export interface IDEClientContext extends PluginContext {
  resourceService: ResourceService;
  historyService: HistoryService;
  commandService: CommandService;
}

export namespace IDEClientContext {
  export function create(container: interfaces.Container): IDEClientContext {
    return {
      container,
      get resourceService() {
        return container.get<ResourceService>(ResourceService)!;
      },
      get historyService() {
        return container.get<HistoryService>(HistoryService)!;
      },
      get commandService() {
        return container.get<CommandService>(CommandService)!;
      },
      get<T>(identifier: interfaces.ServiceIdentifier<T>): T {
        return container.get<T>(identifier);
      },
      getAll<T>(identifier: interfaces.ServiceIdentifier<T>): T[] {
        return container.getAll<T>(identifier);
      },
    };
  }
}

export interface HandlerItem {
  canHandle: (uri: URI) => number;
  open: (uri: URI) => Promise<void>;
}

export interface IDEClientOptions extends LifecycleContribution {
  openHandlers?: (AsClass<OpenHandler> | OpenHandler)[];
  resource?: ResourcePluginOptions;
  view?: ViewPluginOptions;
  navigation?: NavigationPluginOptions;
  command?: CommandPluginOptions;
  history?: HistoryPluginOptions;
  label?: LabelPluginOptions;
  shortcut?: ShortcutsPluginOptions;
  preferences?: PreferencesPluginOptions;
  plugins?: Plugin[];
}
