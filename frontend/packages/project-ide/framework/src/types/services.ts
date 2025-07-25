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
 
import { type ViewService } from '@/plugins/create-preset-plugin/view-service';
import { type WidgetContext } from '@/context/widget-context';

export interface CommandItem<T> {
  id: string;
  label: string;
  when?: 'widgetFocus';
  execute: (ctx?: WidgetContext, props?: T) => void;
  isEnable: (ctx?: WidgetContext, props?: T) => boolean;
}

export interface ShortcutItem {
  // 命令系统中绑定的 id
  commandId: string;
  // 快捷键
  keybinding: string;
  // 是否阻止浏览器原生行为
  preventDefault: boolean;
}

export interface CommandService {
  execute: (id: string, ...args: any[]) => void; // 执行命令
}

export interface MenuItem {
  /**
   * 使用已经注册的 command 的 id
   */
  commandId: string;
  /**
   * 元素选择器
   * 类：.class
   * id：#id
   */
  selector: string;
  /**
   * 子菜单
   */
  submenu?: MenuItem[];
}

export interface ContextMenuService {
  open: (e: React.MouseEvent) => boolean; // 没有任何菜单注册项，返回 false
  registerContextMenu: (options: MenuItem[], match?: RegExp) => void; // 入参形同 widgetRegistry 里的 registerContextMenu
}

export interface ProjectIDEServices {
  contextmenu: ContextMenuService; // 右键菜单服务
  command: CommandService; // 命令服务
  view: ViewService;
}
