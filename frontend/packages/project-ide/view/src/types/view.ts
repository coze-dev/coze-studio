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

import { type FallbackProps } from 'react-error-boundary';
import type React from 'react';

import { type URI } from '@coze-project-ide/core';

import { type WidgetFactory } from '../widget/widget-factory';
import { type ReactWidget } from '../widget/react-widget';
import { type ApplicationShell, type CustomPreferenceConfig } from '../shell';
import { type BoxLayout, type DockPanel } from '../lumino/widgets';

export type ReactElementType = React.ReactElement<any, any> | null;

export enum LayoutPanelType {
  TOP_BAR = 'topBar',
  ACTIVITY_BAR = 'activityBar',
  PRIMARY_SIDEBAR = 'primarySidebar',
  MAIN_PANEL = 'mainPanel',
  SECONDARY_SIDEBAR = 'secondarySidebar',
  BOTTOM_PANEL = 'bottomPanel',
  STATUS_BAR = 'statusBar',
  // Not used yet, reserved for expansion
  RIGHT_BAR = 'rightBar',
}

export const allLayoutEnums = [
  LayoutPanelType.TOP_BAR,
  LayoutPanelType.ACTIVITY_BAR,
  LayoutPanelType.PRIMARY_SIDEBAR,
  LayoutPanelType.MAIN_PANEL,
  LayoutPanelType.SECONDARY_SIDEBAR,
  LayoutPanelType.BOTTOM_PANEL,
  LayoutPanelType.STATUS_BAR,
  LayoutPanelType.RIGHT_BAR,
];

/**
 * Widget description data
 */
interface WidgetDescription {
  uri: URI;
  innerState: string;
}
interface TabPanelData {
  /** fixed value */
  type: 'tab-area';
  /** Currently active tab */
  currentIndex?: number;
  widgets?: WidgetDescription[];
}
/**
 * Main panel data structure
 */
interface MainPanelData {
  main?: TabPanelData;
}
interface BottomPanelData {
  main?: TabPanelData;
  /** Whether to fold by default */
  expanded?: boolean;
}

export interface ActivityBarItem {
  /**
   * Menu location
   */
  position: 'top' | 'bottom';
  /**
   * uri
   */
  uri: URI;
  /**
   * Tooltip Copywriting
   */
  tooltip?: string;
  /**
   * Business side hijacking implementation item click
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface StatusBarItem {
  position: 'left' | 'right';
  uri: URI;
}

/**
 * Support for incoming DockPanel options
 */
export interface SplitOptions {
  /**
   * Maximum number of split screens
   */
  maxSplitCount: number;
  /**
   * Split screen direction limit, no limit if not transmitted
   */
  splitOrientation?: 'horizontal' | 'vertical';
}

export interface DockPanelConfig {
  splitOptions?: SplitOptions;
  dockPanelOptions?: Partial<DockPanel.IOptions>;
}

export interface SplitScreenConfig {
  main?: DockPanelConfig;
  bottom?: DockPanelConfig;
}

/** default data */
export interface LayoutData {
  debugBar?: {
    render: () => ReactElementType;
    memoPosition?: boolean;
    defaultPosition?: {
      left: string;
      top: string;
    };
  };
  activityBarItems?: ActivityBarItem[];

  statusBarItems?: StatusBarItem[];
  defaultWidgets?: URI[];

  /** persistent data */
  mainPanel?: MainPanelData;
  bottomPanel?: BottomPanelData;
}

export interface PresetConfigType {
  /**
   * Custom split-screen rule configuration
   */
  splitScreenConfig?: SplitScreenConfig;
  /**
   * Disable preset right-click menu
   */
  disableContextMenu?: boolean;
  /**
   * Disable full screen
   */
  disableFullScreen?: boolean;
}

export interface ViewPluginOptions {
  // preset configuration
  presetConfig?: PresetConfigType;
  /**
   * All custom widget factories
   */
  widgetFactories?: WidgetFactory[];
  /**
   * Widget error rendering
   */
  widgetFallbackRender?: React.FC<{ widget: ReactWidget } & FallbackProps>;
  /**
   * Default layout information
   */
  defaultLayoutData?: LayoutData;

  /**
   * The key to persistent data storage
   */
  getStorageKey?: () => string;

  /**
   * Turn off persistence logic
   */
  restoreDisabled?: boolean;
  /**
   * custom settings
   */
  customPreferenceConfigs?: CustomPreferenceConfig[];

  /**
   * Custom IDE layout
   */
  customLayout?: (shell: ApplicationShell) => BoxLayout;
}

/**
 * menu path
 */
export type MenuPath = string[];
