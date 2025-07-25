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
  // widget 渲染区域
  area?: LayoutPanelType;
  // 规则匹配
  match: RegExp;
  canClose?: () => boolean;
  // 数据存储
  createStore?: (uri?: URI) => T;
  // 注册
  registerCommands?: () => CommandItem<T>[];
  registerShortcuts?: () => ShortcutItem[];
  registerContextMenu?: () => MenuItem[];
  renderStatusbar?: (ctx: WidgetContext<T>) => void;
  renderIcon?: (ctx: WidgetContext<T>) => React.ReactElement<any, any>;
  renderContent: (
    ctx: WidgetContext<T>,
    widget?: ReactWidget,
  ) => React.ReactElement<any, any>;

  // 生命周期
  load?: (ctx: WidgetContext<T>) => Promise<void>;
  /**
   * 注意：分屏场景，如果有一个面板之前未展示，会先 focus 那个面板，然后 focus 当前选中的面板。
   */
  onFocus?: (ctx: WidgetContext<T>) => void;
  /**
   * 业务侧销毁逻辑
   * createStore 的销毁逻辑由业务侧自行处理
   */
  onDispose?: (ctx: WidgetContext<T>) => void;
}

export const RegistryHandler = Symbol('RegistryHandler');

export type RegistryHandler<T = any> = WidgetRegistry<T>;
