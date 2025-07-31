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
   * Evoke the bottom panel
   */
  toggleBottomLayout() {
    this.shell.bottomSplitLayout.setRelativeSizes([0.7, 0.3]);
  }

  /**
   * Hide bottom panel
   */
  hideBottomLayout() {
    this.shell.bottomSplitLayout.setRelativeSizes([1, 0]);
  }

  /**
   * Get all open tab titles
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
   * Get all tabs currently open in the panel
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
   * Close all tabs except the current tab
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
   * Open the next tab in the main panel
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
   * Open the previous tab of the main panel
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
   * Enable full screen mode
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
   * Turn off full screen mode
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
   * full screen mode toggle
   */
  switchFullScreenMode() {
    if (!this.isFullScreenMode) {
      this.enableFullScreenMode();
    } else {
      this.disableFullScreenMode();
    }
  }

  /**
   * Set the current activityBar item
   */
  setActivityBarUri(uri: URI) {
    this.shell.activityBarWidget.setCurrentUri(uri);
  }

  /**
   * Get the current activityBar active item
   */
  get activityBarUri() {
    return this.shell.activityBarWidget.currentUri;
  }
}
