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
 
import { type AsClass, type MaybePromise } from '@flowgram-adapter/common';
import { type URI } from '@coze-project-ide/core';

import { type LayoutPanelType, type ToolbarAlign } from '../types';
import { type ReactWidget } from './react-widget';

export const WidgetFactory = Symbol('WidgetFactory');

export interface ToolbarItem {
  // 1. 携带 commandId 走命令模式
  commandId?: string;
  tooltip?: string;
  // 2. 携带 render 走直接渲染的模式
  render?: (widget: ReactWidget) => React.ReactElement<any, any> | null;

  /**
   * toolbar 对齐位置，默认是 ToolbarAlign.TRAILING
   */
  align?: ToolbarAlign;
}

export interface WidgetFactory {
  /**
   * widget 面板所在的区域
   */
  area: LayoutPanelType;
  /**
   * widget 面板的 toolbar，只有 dockpanel 才会渲染
   */
  toolbarItems?: ToolbarItem[];
  /**
   * 通过 render 方法注入
   */
  render?: () => React.ReactElement<any, any> | null;
  /**
   * 通过 widget 方式注入
   */
  createWidget?: (uri: URI) => MaybePromise<ReactWidget>;
  /**
   * 指定 widget class
   */
  widget?: AsClass<ReactWidget>;
  /**
   * 根据 uri 进行面板匹配
   */
  canHandle?: (uri: URI) => boolean;
  /**
   * 通过 uri 生成 widget id
   */
  getId?: (uri: URI) => string;
  /**
   * 业务侧通过 uri 正则匹配
   */
  match?: RegExp;
}
