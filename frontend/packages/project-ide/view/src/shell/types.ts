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
 
import { type DockPanel, type Widget } from '../lumino/widgets';

/**
 * 版本号控制向下不兼容问题
 */
export type ApplicationShellLayoutVersion =
  /** 初始化版本 */
  0.2;

export const applicationShellLayoutVersion: ApplicationShellLayoutVersion = 0.2;

/**
 * The areas of the application shell where widgets can reside.
 */
export type Area =
  | 'main'
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'secondaryWindow';

/**
 * General options for the application shell. These are passed on construction and can be modified
 * through dependency injection (`ApplicationShellOptions` symbol).
 */
export interface Options extends Widget.IOptions {}

export interface LayoutData {
  version?: string | ApplicationShellLayoutVersion;
  mainPanel?: DockPanel.ILayoutConfig & {
    mode: DockPanel.Mode;
  };
  primarySidebar?: {
    widgets?: Widget[];
  };
  bottomPanel?: DockPanel.ILayoutConfig & {
    // 是否折叠
    expanded?: boolean;
  };
  split?: {
    main?: number[];
    leftRight?: number[];
  };
}

/**
 * Data to save and load the bottom panel layout.
 */
export interface BottomPanelLayoutData {
  config?: DockPanel.ILayoutConfig;
  size?: number;
  expanded?: boolean;
  pinned?: boolean[];
}
