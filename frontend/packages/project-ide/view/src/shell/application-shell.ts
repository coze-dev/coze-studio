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

import { inject, injectable, optional } from 'inversify';
import { Emitter, type RecursivePartial } from '@flowgram-adapter/common';
import { NavigationHistory, type URI } from '@coze-project-ide/core';

import { WidgetManager } from '../widget-manager';
import {
  STATUS_BAR_CONTENT,
  type StatusBarWidget,
} from '../widget/react-widgets/status-bar-widget';
import {
  ACTIVITY_BAR_CONTENT,
  type ActivityBarWidget,
} from '../widget/react-widgets/activity-bar-widget';
import { ReactWidget } from '../widget/react-widget';
import {
  type SidePanelHandler,
  SidePanelHandlerFactory,
} from '../widget/handlers/side-panel-handler';
import { DockPanelRendererFactory } from '../widget/dock-panel-renderer-factory';
import { type DockPanelRenderer } from '../widget/dock-panel-renderer';
import { FlowDockPanel } from '../widget/dock-panel';
import { type AbstractWidget } from '../widget/base-widget';
import { createBoxLayout, createSplitLayout } from '../utils/layout';
import { isURIMatch } from '../utils';
import { type SplitOptions, type SplitScreenConfig } from '../types/view';
import { LayoutPanelType } from '../types';
import {
  type BoxLayout,
  BoxPanel,
  type DockLayout,
  type DockPanel,
  Panel,
  type SplitLayout,
  SplitPanel,
  type Title,
  Widget,
} from '../lumino/widgets';
import { PANEL_CLASS_NAME_MAP, SINGLE_MODE } from '../constants';
import {
  applicationShellLayoutVersion,
  type Options,
  type LayoutData,
} from './types';

export const ApplicationShellOptions = Symbol('ApplicationShellOptions');

interface ShellProps {
  createLayout?: (shell: ApplicationShell) => BoxLayout;
  splitScreenConfig?: SplitScreenConfig;
  disableFullScreen?: boolean;
}

@injectable()
export class ApplicationShell extends Widget {
  @inject(FlowDockPanel.Factory)
  protected readonly dockPanelFactory: FlowDockPanel.Factory;

  @inject(WidgetManager)
  protected widgetManager: WidgetManager;

  @inject(NavigationHistory)
  protected navigationHistory: NavigationHistory;

  constructor(
    @inject(DockPanelRendererFactory)
    protected dockPanelRendererFactory: () => DockPanelRenderer,
    @inject(SidePanelHandlerFactory)
    protected readonly sidePanelHandlerFactory: () => SidePanelHandler,
    @inject(ApplicationShellOptions)
    @optional()
    options: RecursivePartial<Options> = {},
  ) {
    super(options as Widget.IOptions);
  }

  private _currentWidget?: ReactWidget;

  private _currentWidgetParent?: Widget | null;

  public disableFullScreen?: boolean;

  leftPanelHandler: SidePanelHandler;

  mainPanel: FlowDockPanel;

  bottomPanel: FlowDockPanel;

  bottomSplitLayout: SplitLayout;

  leftRightSplitLayout: SplitLayout;

  statusBar: Panel;

  rightToolbar: Panel;

  activityBar: Panel;

  topPanel: Panel;

  primarySidebar: Panel;

  secondarySidebar: Panel;

  activityBarWidget: ActivityBarWidget;

  statusBarWidget: StatusBarWidget;

  closeWidgetUriStack: URI[] = [];

  /**
   * Current focus widget change
   */
  protected readonly onCurrentWidgetChangeEmitter = new Emitter<
    AbstractWidget | undefined
  >();

  readonly onCurrentWidgetChange = this.onCurrentWidgetChangeEmitter.event;

  async init(props: ShellProps): Promise<void> {
    const { createLayout, splitScreenConfig, disableFullScreen } = props;
    this.disableFullScreen = disableFullScreen;
    this.mainPanel = this.createMainPanel({
      splitOptions: splitScreenConfig?.main?.splitOptions,
      ...splitScreenConfig?.main?.dockPanelOptions,
    });
    this.bottomPanel = this.createBottomPanel({
      splitOptions: splitScreenConfig?.bottom?.splitOptions,
      ...splitScreenConfig?.bottom?.dockPanelOptions,
    });
    this.bottomPanel.hide();

    this.topPanel = this.createPanel(LayoutPanelType.TOP_BAR);
    // Extension, not currently in use.
    this.rightToolbar = this.createPanel(LayoutPanelType.RIGHT_BAR);
    // Default mode rightToolbar hide
    this.rightToolbar.hide();
    this.statusBar = this.createPanel(LayoutPanelType.STATUS_BAR);
    this.activityBar = this.createPanel(LayoutPanelType.ACTIVITY_BAR);
    this.secondarySidebar = this.createPanel(LayoutPanelType.SECONDARY_SIDEBAR);

    // Create left panel
    this.leftPanelHandler = this.sidePanelHandlerFactory();
    this.leftPanelHandler.create('left');
    this.leftPanelHandler.expand();
    this.primarySidebar = this.leftPanelHandler.contentPanel;
    const uri = PANEL_CLASS_NAME_MAP[LayoutPanelType.PRIMARY_SIDEBAR];
    this.primarySidebar.id = uri.displayName;
    this.widgetManager.setWidget(uri.toString(), this.primarySidebar);

    // Default right side hide
    this.secondarySidebar.hide();
    this.layout = createLayout?.(this) || this.createLayout();

    this.activityBarWidget = await this.widgetManager.getOrCreateWidgetFromURI(
      ACTIVITY_BAR_CONTENT,
    );
    try {
      this.statusBarWidget = await this.widgetManager.getOrCreateWidgetFromURI(
        STATUS_BAR_CONTENT,
      );
    } catch (e) {}
  }

  async addWidget(
    widget: AbstractWidget,
    options?: {
      area: LayoutPanelType;
      addOptions?: DockLayout.IAddOptions;
      mode?: DockPanel.Mode;
    },
  ): Promise<void> {
    if (!widget.id) {
      console.error(
        'Widgets added to the application shell must have a unique id property.',
      );
      return;
    }
    const { area, mode } = options || {};
    switch (area) {
      case LayoutPanelType.MAIN_PANEL:
        this.mainPanel.mode = mode || 'multiple-document';
        this.mainPanel.addWidget(widget, {
          addClickListener: true,
          ...options?.addOptions,
        });
        break;
      case LayoutPanelType.TOP_BAR:
        this.topPanel.addWidget(widget);
        break;
      case LayoutPanelType.BOTTOM_PANEL:
        this.bottomPanel.addWidget(widget);
        break;
      case LayoutPanelType.STATUS_BAR:
        this.statusBar.addWidget(widget);
        break;
      case LayoutPanelType.ACTIVITY_BAR:
        this.activityBar.addWidget(widget);
        break;
      case LayoutPanelType.PRIMARY_SIDEBAR:
        this.primarySidebar.addWidget(widget);
        break;
      case LayoutPanelType.SECONDARY_SIDEBAR:
        this.secondarySidebar.addWidget(widget);
        break;
      default:
        throw new Error(`Unexpected area: ${options?.area}`);
    }
    // topBar and statusbar do not listen
    if (
      area !== LayoutPanelType.STATUS_BAR &&
      area !== LayoutPanelType.TOP_BAR
    ) {
      this.track(widget);
    }
  }

  getWidgetArea(widget: AbstractWidget) {
    const { parent } = widget;
    switch (parent) {
      case this.mainPanel:
        return LayoutPanelType.MAIN_PANEL;
      case this.topPanel:
        return LayoutPanelType.TOP_BAR;
      case this.bottomPanel:
        return LayoutPanelType.BOTTOM_PANEL;
      case this.statusBar:
        return LayoutPanelType.STATUS_BAR;
      case this.activityBar:
        return LayoutPanelType.ACTIVITY_BAR;
      case this.primarySidebar:
        return LayoutPanelType.PRIMARY_SIDEBAR;
      case this.secondarySidebar:
        return LayoutPanelType.SECONDARY_SIDEBAR;
    }
    throw new Error(`Unknown widget area: ${widget.id}`);
  }

  getPanelFromArea(area: LayoutPanelType) {
    switch (area) {
      case LayoutPanelType.TOP_BAR:
        return this.topPanel;
      case LayoutPanelType.ACTIVITY_BAR:
        return this.activityBar;
      case LayoutPanelType.BOTTOM_PANEL:
        return this.bottomPanel;
      case LayoutPanelType.PRIMARY_SIDEBAR:
        return this.primarySidebar;
      case LayoutPanelType.SECONDARY_SIDEBAR:
        return this.secondarySidebar;
      case LayoutPanelType.STATUS_BAR:
        return this.statusBar;
      case LayoutPanelType.RIGHT_BAR:
        return this.rightToolbar;
      default:
        return this.mainPanel;
    }
  }

  // Methods for local persistent consumption
  setCurrentWidget(widget?: ReactWidget) {
    this._currentWidget = widget;
    this._currentWidgetParent = widget?.parent;
  }

  getCurrentWidget(
    area: LayoutPanelType.MAIN_PANEL | LayoutPanelType.BOTTOM_PANEL,
  ): Widget | undefined {
    let title: Title<Widget> | null | undefined;
    switch (area) {
      case LayoutPanelType.MAIN_PANEL:
        title = this.mainPanel.currentTitle;
        break;
      case LayoutPanelType.BOTTOM_PANEL:
        title = this.bottomPanel.currentTitle;
        break;
      default:
        throw new Error(`Illegal argument: ${area}`);
    }
    return title ? title.owner : undefined;
  }

  get currentWidget(): ReactWidget | undefined {
    return this._currentWidget;
  }

  protected createLayout(): BoxLayout {
    const bottomSplitLayout = createSplitLayout(
      [this.mainPanel, this.bottomPanel],
      [1, 0],
      {
        orientation: 'vertical',
        spacing: 0,
      },
    );
    this.bottomSplitLayout = bottomSplitLayout;
    const middleContentPanel = new SplitPanel({ layout: bottomSplitLayout });

    const leftRightSplitLayout = createSplitLayout(
      [
        // Unretractable bar on the left
        this.primarySidebar,
        middleContentPanel,
        // Non-retractable bar on the right
        this.secondarySidebar,
      ],
      [0, 1, 0],
      { orientation: 'horizontal', spacing: 0 },
    );
    this.leftRightSplitLayout = leftRightSplitLayout;
    const mainDockPanel = new SplitPanel({ layout: leftRightSplitLayout });

    const centerLayout = createBoxLayout(
      [
        // Unretractable bar on the left
        this.activityBar,
        mainDockPanel,
        // Non-retractable bar on the right
        this.rightToolbar,
      ],
      [0, 1, 0],
      { direction: 'left-to-right', spacing: 0 },
    );
    const centerPanel = new BoxPanel({ layout: centerLayout });

    return createBoxLayout(
      [this.topPanel, centerPanel, this.statusBar],
      [0, 1, 0],
      {
        direction: 'top-to-bottom',
        spacing: 0,
      },
    );
  }

  protected createPanel(type: LayoutPanelType): Panel {
    const panel = new Panel();
    const uri = PANEL_CLASS_NAME_MAP[type];
    panel.id = uri.displayName;
    this.widgetManager.setWidget(uri.toString(), panel);
    return panel;
  }

  protected createBottomPanel(config: {
    splitOptions?: SplitOptions;
  }): FlowDockPanel {
    const BOTTOM_AREA_CLASS = 'flow-app-bottom';
    const renderer = this.dockPanelRendererFactory();
    (renderer as DockPanelRenderer).tabBarClasses.push(BOTTOM_AREA_CLASS);
    const dockPanel = this.dockPanelFactory({
      mode: 'multiple-document',
      renderer,
      spacing: 0,
      ...config,
    });
    const uri = PANEL_CLASS_NAME_MAP[LayoutPanelType.BOTTOM_PANEL];
    dockPanel.id = uri.displayName;
    dockPanel.node.addEventListener('p-dragenter', event => {
      event.preventDefault();
      event.stopPropagation();
      // Make sure that the main panel hides its overlay when the bottom panel is expanded
      // this.mainPanel.overlay.hide(0);
    });
    this.widgetManager.setWidget(uri.toString(), dockPanel);
    return dockPanel;
  }

  protected createMainPanel(config: {
    splitOptions?: SplitOptions;
  }): FlowDockPanel {
    const renderer = this.dockPanelRendererFactory();
    const dockPanel = this.dockPanelFactory({
      mode: 'multiple-document',
      renderer,
      spacing: 0,
      ...config,
    });
    const uri = PANEL_CLASS_NAME_MAP[LayoutPanelType.MAIN_PANEL];
    dockPanel.id = uri.displayName;
    this.widgetManager.setWidget(uri.toString(), dockPanel);
    return dockPanel;
  }

  /**
   * Scroll the tab of the currently selected widget to the viewport
   */
  tabbarIntoView(behavior?: boolean) {
    const { mainPanel } = this;
    const widgets = mainPanel.tabBars();
    for (const customTabBar of widgets) {
      customTabBar?.titles?.forEach(title => {
        if (title?.owner?.id && title.owner.id === this.currentWidget?.id) {
          const currentTabId = `#shell-tab-${this.currentWidget?.uri?.displayName}`;
          const currentTabDom = customTabBar.node.querySelector(currentTabId);
          setTimeout(() => {
            currentTabDom?.scrollIntoView({
              behavior: behavior ? 'smooth' : 'auto',
            });
          }, 0);
        }
      });
    }
  }

  /**
   * Track the given widget so it is considered in the `current` and `active` state of the shell.
   */
  track(widget: Widget): void {
    if (widget instanceof ReactWidget) {
      widget.onActivate(() => {
        this._currentWidget = widget;
        if (widget.parent) {
          this._currentWidgetParent = widget.parent;
        }
        this.onCurrentWidgetChangeEmitter.fire(widget);
        this.tabbarIntoView();
      });
      widget.onDispose(() => {
        const uri = widget.getResourceURI();

        if (uri) {
          const index = this.closeWidgetUriStack.findIndex(p =>
            isURIMatch(p, uri),
          );
          // If there are duplicates, delete them first, and then push them.
          if (index !== -1) {
            this.closeWidgetUriStack.splice(index, 1);
          }
          this.closeWidgetUriStack.push(uri);
        }
        if (this._currentWidget === widget) {
          const nextWidget = (this._currentWidgetParent as FlowDockPanel)
            ?.selectedWidgets?.()
            ?.next?.()?.value;

          this._currentWidget = nextWidget;
          this.onCurrentWidgetChangeEmitter.fire(nextWidget);
          this.tabbarIntoView();
        }
        if (!this.bottomPanel.selectedWidgets()?.next?.()?.value) {
          this.bottomPanel.hide();
        }
      });
    }
  }

  /***********************************************************************
   * Layout related
   */

  getLayoutData(): LayoutData {
    // Record subscreen layout data
    const widgets: Widget[] = [];
    this.primarySidebar.widgets.forEach(_widget => {
      widgets.push(_widget);
    });

    return {
      version: applicationShellLayoutVersion,
      mainPanel: {
        ...this.mainPanel.saveLayout(),
        mode: this.mainPanel.mode,
      },
      bottomPanel: {
        ...this.bottomPanel.saveLayout(),
        expanded: this.bottomPanel.isHidden,
      },
      primarySidebar: {
        widgets,
      },
      split: {
        main: this.bottomSplitLayout.relativeSizes(),
        leftRight: this.leftRightSplitLayout.relativeSizes(),
      },
    };
  }

  setLayoutData(data: LayoutData) {
    const { version } = data;
    const layoutData = data;
    if (version && Number(version) > applicationShellLayoutVersion) {
      return;
    }
    const { mainPanel, bottomPanel, split } = layoutData;
    if (mainPanel) {
      this.mainPanel.restoreLayout(mainPanel);
      if (mainPanel.mode === SINGLE_MODE) {
        this.mainPanel.mode = SINGLE_MODE;
      }
      this.mainPanel.initWidgets();
    }
    if (bottomPanel) {
      const { expanded, ...bottomLayout } = bottomPanel;
      this.bottomPanel.restoreLayout(bottomLayout);
      if (!expanded) {
        this.bottomPanel.show();
      }
    }
    if (split?.main) {
      this.bottomSplitLayout.setRelativeSizes(split.main);
      (window as any).temp = this.bottomSplitLayout;
    }
    if (split?.leftRight) {
      this.leftRightSplitLayout.setRelativeSizes(split.leftRight);
    }
  }

  // Below is tabs switching, which will be enabled when mainPanel switches to dockpanel.
  // activateWithLabel(widget: Widget) {
  //   this.mainPanel.activateWidget(widget);
  // }

  // findTabBar(label: string): {
  //   tabBar: TabBar<Widget> | undefined;
  //   title: Title<Widget> | undefined;
  //   index: number;
  // } {
  //   let selectedTabBar = undefined;
  //   let selectedTitle = undefined;
  //   let selectedIndex = 0;
  //   each(this.mainPanel.tabBars(), bar => {
  //     bar.titles.forEach((title, idx) => {
  //       if (title.label === label) {
  //         title?.owner.activate();
  //         selectedTabBar = bar;
  //         selectedTitle = title;
  //         selectedIndex = idx;
  //       }
  //     });
  //   });
  //   return {
  //     tabBar: selectedTabBar,
  //     title: selectedTitle,
  //     index: selectedIndex,
  //   };
  // }
}
