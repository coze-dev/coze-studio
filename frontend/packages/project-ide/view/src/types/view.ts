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
  // 暂时未用到，留作扩展
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
 * widget 描述数据
 */
interface WidgetDescription {
  uri: URI;
  innerState: string;
}
interface TabPanelData {
  /** 固定值 */
  type: 'tab-area';
  /** 当前激活的 tab */
  currentIndex?: number;
  widgets?: WidgetDescription[];
}
/**
 * main panel 的数据结构
 */
interface MainPanelData {
  main?: TabPanelData;
}
interface BottomPanelData {
  main?: TabPanelData;
  /** 是否默认折叠 */
  expanded?: boolean;
}

export interface ActivityBarItem {
  /**
   * menu 位置
   */
  position: 'top' | 'bottom';
  /**
   * uri
   */
  uri: URI;
  /**
   * tooltip 提示文案
   */
  tooltip?: string;
  /**
   * 业务侧劫持实现 item 点击
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface StatusBarItem {
  position: 'left' | 'right';
  uri: URI;
}

/**
 * 支持传入 DockPanel options
 */
export interface SplitOptions {
  /**
   * 最大分屏数量限制
   */
  maxSplitCount: number;
  /**
   * 分屏方向限制，不传则不限制
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

/** 预设数据 */
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

  /** 持久化数据 */
  mainPanel?: MainPanelData;
  bottomPanel?: BottomPanelData;
}

export interface PresetConfigType {
  /**
   * 自定义分屏规则配置
   */
  splitScreenConfig?: SplitScreenConfig;
  /**
   * 禁用预置右键菜单
   */
  disableContextMenu?: boolean;
  /**
   * 禁用全屏
   */
  disableFullScreen?: boolean;
}

export interface ViewPluginOptions {
  // 预置配置
  presetConfig?: PresetConfigType;
  /**
   * 所有自定义 widget 工厂
   */
  widgetFactories?: WidgetFactory[];
  /**
   * widget 报错渲染
   */
  widgetFallbackRender?: React.FC<{ widget: ReactWidget } & FallbackProps>;
  /**
   * 默认布局信息
   */
  defaultLayoutData?: LayoutData;

  /**
   * 持久化数据存储的 key
   */
  getStorageKey?: () => string;

  /**
   * 关闭持久化逻辑
   */
  restoreDisabled?: boolean;
  /**
   * 自定义设置
   */
  customPreferenceConfigs?: CustomPreferenceConfig[];

  /**
   * 自定义 IDE 布局
   */
  customLayout?: (shell: ApplicationShell) => BoxLayout;
}

/**
 * 菜单路径
 */
export type MenuPath = string[];
