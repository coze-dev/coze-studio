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
import {
  ApplicationShell,
  WidgetManager,
  type URI,
  type BoxPanel,
  OpenerService,
  Emitter,
  type Event,
  type DockLayout,
  type ReactWidget,
  LayoutPanelType,
  ViewRenderer,
} from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type WidgetContext } from '@/context';
import {
  UI_BUILDER_URI,
  MAIN_PANEL_DEFAULT_URI,
  UI_BUILDER_CONTENT,
  SECONDARY_SIDEBAR_URI,
} from '@/constants';

import { type ModeType } from '../../types';

@injectable()
export class ViewService {
  @inject(ApplicationShell)
  public shell: ApplicationShell;

  @inject(WidgetManager)
  private widgetManager: WidgetManager;

  @inject(OpenerService)
  openerService: OpenerService;

  @inject(ViewRenderer)
  private viewRenderer: ViewRenderer;

  public isFullScreenMode = false;

  protected readonly onSidebarVisibleChangeEmitter = new Emitter<boolean>();
  readonly onSidebarVisibleChange: Event<boolean> =
    this.onSidebarVisibleChangeEmitter.event;

  protected readonly onSecondarySidebarVisibleChangeEmitter =
    new Emitter<boolean>();
  readonly onSecondarySidebarChange: Event<boolean> =
    this.onSecondarySidebarVisibleChangeEmitter.event;

  protected readonly onFullScreenModeChangeEmitter = new Emitter<boolean>();
  readonly onFullScreenModeChange: Event<boolean> =
    this.onFullScreenModeChangeEmitter.event;

  /**
   * Main Sidebar Feature Collection
   */
  public primarySidebar = {
    onSidebarVisibleChange: this.onSidebarVisibleChange,
    getVisible: () => this.shell.primarySidebar.isVisible,
    changeVisible: (vis: boolean) => {
      if (vis) {
        this.shell.primarySidebar.show();
        this.onSidebarVisibleChangeEmitter.fire(true);
      } else {
        this.shell.primarySidebar.hide();
        this.onSidebarVisibleChangeEmitter.fire(false);
      }
    },
  };

  public secondarySidebar = {
    getVisible: () => this.shell.secondarySidebar.isVisible,
    changeVisible: (vis: boolean) => {
      if (vis) {
        // Before opening, you need to determine whether the panel has been registered and opened.
        const secondaryPanel = this.widgetManager.getWidgetFromURI(
          SECONDARY_SIDEBAR_URI,
        );
        if (!secondaryPanel) {
          this.openerService.open(SECONDARY_SIDEBAR_URI);
        }
        this.shell.secondarySidebar.show();
        this.onSecondarySidebarVisibleChangeEmitter.fire(true);
      } else {
        this.shell.secondarySidebar.hide();
        this.onSecondarySidebarVisibleChangeEmitter.fire(false);
      }
    },
  };

  private switchPanel(uri?: URI) {
    const uiBuilderPanel = this.widgetManager.getWidgetFromURI(UI_BUILDER_URI);
    if (uri && UI_BUILDER_URI.match(uri)) {
      // Jump to UIBuilder
      (this.shell.mainPanel.parent?.parent as BoxPanel).hide();
      uiBuilderPanel?.show();
    } else {
      uiBuilderPanel?.hide();
      (this.shell.mainPanel.parent?.parent as BoxPanel).show();
    }
  }

  async uiBuilderReopen() {
    const uiBuilderWidget = await this.widgetManager.getOrCreateWidgetFromURI(
      UI_BUILDER_CONTENT,
    );
    uiBuilderWidget.dispose();
    this.openPanel('ui-builder');
  }

  secondarySidebarReOpen() {
    if (!this.secondarySidebar.getVisible()) {
      return;
    }
    const secondaryPanel = this.widgetManager.getWidgetFromURI(
      SECONDARY_SIDEBAR_URI,
    );
    secondaryPanel?.dispose();
    this.openerService.open(SECONDARY_SIDEBAR_URI);
  }

  async open(uri: URI) {
    this.switchPanel(uri);
    // openService
    await this.openerService.open(uri);
  }

  async openPanel(type?: ModeType) {
    if (type === 'ui-builder') {
      this.switchPanel(UI_BUILDER_URI);
      const factory = this.widgetManager.getFactoryFromURI(UI_BUILDER_CONTENT)!;
      const uiBuilderWidget = await this.widgetManager.getOrCreateWidgetFromURI(
        UI_BUILDER_CONTENT,
        factory,
      );
      this.viewRenderer.addReactPortal(uiBuilderWidget);
      if (!uiBuilderWidget?.isAttached && uiBuilderWidget) {
        const uiBuilderPanel = this.widgetManager.getWidgetFromURI(
          UI_BUILDER_URI,
        ) as BoxPanel;
        uiBuilderPanel?.addWidget?.(uiBuilderWidget);
      }
    } else {
      this.switchPanel();
    }
  }
  // Open default page
  async openDefault() {
    await this.openerService.open(MAIN_PANEL_DEFAULT_URI, {
      mode: 'single-document',
    });
  }
  closeWidgetByUri(uri: URI) {
    const widget = this.widgetManager.getWidgetFromURI(uri);
    if (widget) {
      widget.close();
    }
  }

  getWidgetContextFromURI<T>(uri: URI): WidgetContext<T> | undefined {
    const widgetFromURI = this.widgetManager.getWidgetFromURI(
      uri,
    ) as ProjectIDEWidget;
    if (widgetFromURI) {
      return widgetFromURI.context;
    }
    return undefined;
  }

  // Since the maximum number of split screens is 2
  // Therefore, children [0] is the left split screen, and children [1] is the right split screen
  splitScreen(direction: 'left' | 'right', widget: ReactWidget) {
    const mode = direction === 'left' ? 'split-left' : 'split-right';
    const splitScreenIdx = direction === 'left' ? 0 : 1;

    const layoutConfig = (
      this.shell.mainPanel?.layout as DockLayout
    )?.saveLayout()?.main;
    // No split-screen scene, open it directly
    if ((layoutConfig as DockLayout.ITabAreaConfig)?.type === 'tab-area') {
      this.shell.mainPanel.addWidget(widget, {
        mode,
      });
      this.shell.mainPanel.activateWidget(widget);
    } else if (
      (layoutConfig as DockLayout.ISplitAreaConfig)?.type === 'split-area'
    ) {
      const { widgets } = (layoutConfig as DockLayout.ISplitAreaConfig)
        ?.children[splitScreenIdx] as DockLayout.ITabAreaConfig;
      const tabActivateWidget = widgets.find(_widget => _widget.isVisible);
      // split screen scene
      this.shell.mainPanel.addWidget(widget, {
        mode: 'tab-after',
        ref: tabActivateWidget,
      });
      this.shell.mainPanel.activateWidget(widget);
    }
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
   * Enable full screen mode
   * In CozeProject IDE, full-screen mode hides the sidebar and top navigation bar
   */
  enableFullScreenMode() {
    if (this.isFullScreenMode) {
      return;
    }
    // Hide Sidebar
    this.primarySidebar.changeVisible(false);
    // Hide top navigation bar
    const topBar = this.shell.getPanelFromArea(LayoutPanelType.TOP_BAR);
    topBar.hide();

    this.isFullScreenMode = true;
    this.onFullScreenModeChangeEmitter.fire(true);
  }

  disableFullScreenMode() {
    if (!this.isFullScreenMode) {
      return;
    }
    // Show Sidebar
    this.primarySidebar.changeVisible(true);
    // Show top navigation bar
    const topBar = this.shell.getPanelFromArea(LayoutPanelType.TOP_BAR);
    topBar.show();

    this.isFullScreenMode = false;
    this.onFullScreenModeChangeEmitter.fire(false);
  }
}
