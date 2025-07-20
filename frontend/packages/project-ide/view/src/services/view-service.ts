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
 
import { inject, injectable } from 'inversify';
import { Emitter } from '@flowgram-adapter/common';
import { type URI } from '@coze-project-ide/core';

import { WidgetOpenHandler } from '../widget/widget-open-handler';
import { type ReactWidget } from '../widget/react-widget';
import { type FlowDockPanel } from '../widget/dock-panel';
import { type CustomTitleType, LayoutPanelType } from '../types';
import { ApplicationShell } from '../shell';
import { type DockLayout } from '../lumino/widgets';
import { ALL_PANEL_TYPES } from '../constants/view';

@injectable()
export class ViewService {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(WidgetOpenHandler) protected readonly openHandler: WidgetOpenHandler;

  private isFullScreenMode = false;

  private onFullScreenModeChangeEmitter = new Emitter<boolean>();

  onFullScreenModeChange = this.onFullScreenModeChangeEmitter.event;

  private prevPanelMap = new Map<LayoutPanelType, boolean>();

  /**
   * 唤起底部面板
   */
  toggleBottomLayout() {
    this.shell.bottomSplitLayout.setRelativeSizes([0.7, 0.3]);
  }

  /**
   * 隐藏底部面板
   */
  hideBottomLayout() {
    this.shell.bottomSplitLayout.setRelativeSizes([1, 0]);
  }

  /**
   * 获取所有打开的 tab title
   */
  getOpenTitles() {
    let titles: CustomTitleType[] = [];
    const tabBars = (
      this.shell.mainPanel.layout as unknown as DockLayout
    ).tabBars();
    for (const tabBar of tabBars) {
      titles = titles.concat(tabBar.titles as CustomTitleType[]);
    }
    return titles;
  }

  /**
   * 获取当前 panel 打开的所有 tab
   */
  getAllTabsFromArea(
    area: LayoutPanelType.MAIN_PANEL | LayoutPanelType.BOTTOM_PANEL,
  ) {
    const widgets =
      area === LayoutPanelType.MAIN_PANEL
        ? this.shell.mainPanel.widgets()
        : this.shell.bottomPanel.widgets();
    const dockPanels: any[] = [];
    for (const dockPanel of widgets) {
      dockPanels.push(dockPanel);
    }
    return dockPanels;
  }

  /**
   * 关闭除了当前 tab 以外的所有 tab
   */
  closeOtherTabs(dispose = true) {
    try {
      const parentWidget = this.shell.currentWidget?.parent;
      if (!parentWidget) {
        return;
      }
      const widgets = (parentWidget as FlowDockPanel).tabBars();
      for (const customTabBar of widgets) {
        [...customTabBar.titles].map(title => {
          if (title.label !== customTabBar.currentTitle?.label) {
            customTabBar.removeTab(title);
            if (dispose) {
              title.owner.dispose();
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 打开主面板的下一个 tab
   */
  openNextTab() {
    const tabBars = (
      this.shell.mainPanel.layout as unknown as DockLayout
    ).tabBars();

    for (const tabbar of tabBars) {
      const idx = tabbar.titles.findIndex(
        title => title.owner === this.shell.currentWidget,
      );
      if (idx !== -1) {
        const nextUri = (
          tabbar.titles[(idx + 1) % tabbar.titles.length].owner as ReactWidget
        )?.getResourceURI();

        if (nextUri) {
          this.openHandler.open(nextUri);
        }
      }
    }
  }

  /**
   * 打开主面板的上一个 tab
   */
  openLastTab() {
    const tabBars = (
      this.shell.mainPanel.layout as unknown as DockLayout
    ).tabBars();

    for (const tabbar of tabBars) {
      const idx = tabbar.titles.findIndex(
        title => title.owner === this.shell.currentWidget,
      );
      if (idx !== -1) {
        const nextUri = (
          tabbar.titles[(idx - 1 + tabbar.titles.length) % tabbar.titles.length]
            .owner as ReactWidget
        )?.getResourceURI();

        if (nextUri) {
          this.openHandler.open(nextUri);
        }
      }
    }
  }

  /**
   * 开启全屏模式
   */
  enableFullScreenMode() {
    if (this.isFullScreenMode) {
      return;
    }
    ALL_PANEL_TYPES.forEach(type => {
      if (type !== LayoutPanelType.MAIN_PANEL) {
        const panel = this.shell.getPanelFromArea(type);
        this.prevPanelMap.set(type, panel.isHidden);
        panel.hide();
      }
    });
    this.isFullScreenMode = true;
    this.onFullScreenModeChangeEmitter.fire(true);
  }

  /**
   * 关闭全屏模式
   */
  disableFullScreenMode() {
    if (!this.isFullScreenMode) {
      return;
    }
    ALL_PANEL_TYPES.forEach(type => {
      if (type !== LayoutPanelType.MAIN_PANEL) {
        const panel = this.shell.getPanelFromArea(type);
        const isHidden = Boolean(this.prevPanelMap.get(type));
        panel.setHidden(isHidden);
      }
    });
    this.isFullScreenMode = false;
    this.onFullScreenModeChangeEmitter.fire(false);
  }

  /**
   * 全屏模式切换
   */
  switchFullScreenMode() {
    if (!this.isFullScreenMode) {
      this.enableFullScreenMode();
    } else {
      this.disableFullScreenMode();
    }
  }

  /**
   * 设置当前 activityBar 激活 item
   */
  setActivityBarUri(uri: URI) {
    this.shell.activityBarWidget.setCurrentUri(uri);
  }

  /**
   * 获取当前 activityBar 激活的 item
   */
  get activityBarUri() {
    return this.shell.activityBarWidget.currentUri;
  }
}
