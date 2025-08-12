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
  // ID bound in the command system
  commandId: string;
  // shortcut
  keybinding: string;
  // Whether to block browser native behavior
  preventDefault: boolean;
}

export interface CommandService {
  execute: (id: string, ...args: any[]) => void; // execute the command
}

export interface MenuItem {
  /**
   * Use the id of a registered command
   */
  commandId: string;
  /**
   * element selector
   * Class:. class
   * id：#id
   */
  selector: string;
  /**
   * submenu
   */
  submenu?: MenuItem[];
}

export interface ContextMenuService {
  open: (e: React.MouseEvent) => boolean; // There are no menu registration items, return false
  registerContextMenu: (options: MenuItem[], match?: RegExp) => void; // Imported parameters are like registerContextMenu in widgetRegistry
}

export interface ProjectIDEServices {
  contextmenu: ContextMenuService; // Right-click menu service
  command: CommandService; // command service
  view: ViewService;
}
