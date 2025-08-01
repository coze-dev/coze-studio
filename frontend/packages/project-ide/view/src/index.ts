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

import PerfectScrollbar from './components/scroll-bar';

export { ReactWidget, ReactWidgetContext } from './widget/react-widget';
export {
  LayoutPanelType,
  ToolbarAlign,
  type ViewPluginOptions,
  type CustomTitleType,
  type CustomTitleChanged,
  type PresetConfigType,
} from './types';
export { ViewManager } from './view-manager';
export { WidgetManager } from './widget-manager';
export { createViewPlugin } from './create-view-plugin';
export { createContextMenuPlugin } from './contributions/context-menu';
export {
  VIEW_CONTAINER_CLASS_NAME,
  HOVER_TOOLTIP_LABEL,
  DEBUG_BAR_DRAGGABLE,
  DISABLE_HANDLE_EVENT,
} from './constants';
export { WidgetFactory, type ToolbarItem } from './widget/widget-factory';
export { HoverService } from './services/hover-service';
export { DragService, type DragPropsType } from './services/drag-service';
export { MenuService } from './contributions/context-menu';
export { ViewService } from './services/view-service';
export { DebugService } from './services/debug-service';
export { FlowDockPanel } from './widget/dock-panel';
import '@vscode/codicons/dist/codicon.css';
import './index.css';

export {
  ViewContribution,
  type ViewOptionRegisterService,
} from './contributions/view-contribution';
export {
  useCurrentWidget,
  useCurrentWidgetFromArea,
  useCurrentResource,
  CurrentResourceContext,
} from './hooks';
export {
  Widget,
  BoxLayout,
  SplitLayout,
  SplitPanel,
  BoxPanel,
  DockLayout,
  TabBar,
} from './lumino/widgets';
export {
  StatefulWidget,
  LayoutRestorer,
  CustomPreferenceContribution,
  type CustomPreferenceConfig,
} from './shell/layout-restorer';
export { ApplicationShell } from './shell/application-shell';

export { PerfectScrollbar };
export { SplitWidget } from './widget/react-widgets/split-widget';
export { createBoxLayout, createSplitLayout } from './utils';
export { TabBarToolbar } from './widget/tab-bar/toolbar';
export { ACTIVITY_BAR_CONTENT } from './widget/react-widgets/activity-bar-widget';
export { ViewRenderer } from './view-renderer';
export { CustomTabBar } from './widget/tab-bar/custom-tabbar';
