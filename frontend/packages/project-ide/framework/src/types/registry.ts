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
  type URI,
  type ReactWidget,
  type LayoutPanelType,
} from '@coze-project-ide/client';

import { type WidgetContext } from '@/context/widget-context';

import { type CommandItem, type MenuItem, type ShortcutItem } from './services';

export interface WidgetRegistry<T = any> {
  // Widget rendering area
  area?: LayoutPanelType;
  // rule matching
  match: RegExp;
  canClose?: () => boolean;
  // data storage
  createStore?: (uri?: URI) => T;
  // Register
  registerCommands?: () => CommandItem<T>[];
  registerShortcuts?: () => ShortcutItem[];
  registerContextMenu?: () => MenuItem[];
  renderStatusbar?: (ctx: WidgetContext<T>) => void;
  renderIcon?: (ctx: WidgetContext<T>) => React.ReactElement<any, any>;
  renderContent: (
    ctx: WidgetContext<T>,
    widget?: ReactWidget,
  ) => React.ReactElement<any, any>;

  // Life Cycle
  load?: (ctx: WidgetContext<T>) => Promise<void>;
  /**
   * Note: For split-screen scenes, if there is a panel that has not been displayed before, it will focus that panel first, and then focus the currently selected panel.
   */
  onFocus?: (ctx: WidgetContext<T>) => void;
  /**
   * Business side destruction logic
   * The destruction logic of createStore is handled by the business side itself
   */
  onDispose?: (ctx: WidgetContext<T>) => void;
}

export const RegistryHandler = Symbol('RegistryHandler');

export type RegistryHandler<T = any> = WidgetRegistry<T>;
