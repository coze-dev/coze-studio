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

/**
 * Business layer data persistence
 */
import { isPlainObject } from 'lodash-es';
import { inject, injectable } from 'inversify';
import {
  ApplicationShell,
  WidgetManager,
  ViewRenderer,
  SIDEBAR_URI,
  MAIN_PANEL_DEFAULT_URI,
  URI,
  type ReactWidget,
  type ProjectIDEWidget,
  OptionsService,
} from '@coze-project-ide/framework';

import { saveLayoutData, readLayoutData } from './utils/layout-store';

/**
 * The persistent widget may be a normal widget or a project-specific widget.
 */
type LayoutWidget = ReactWidget | ProjectIDEWidget;

interface LayoutWidgetData {
  uri: string;
  title?: string;
  iconType?: string;
}

/**
 * Determine if it is a ProjectIDEWidget
 */
const isProjectIDEWidget = (w: LayoutWidget): w is ProjectIDEWidget =>
  !!(w as ProjectIDEWidget).context;

@injectable()
export class LayoutRestoreService {
  @inject(ApplicationShell)
  private applicationShell: ApplicationShell;
  @inject(WidgetManager)
  protected readonly widgetManager: WidgetManager;
  @inject(ViewRenderer)
  protected readonly viewRenderer: ViewRenderer;

  @inject(OptionsService)
  private optionsService: OptionsService;

  /**
   * Is the local data valid?
   */
  private _openFirstWorkflow = false;

  /**
   * Whether to enable persistence is temporarily unconfigurable. If there is a problem during development, it can be turned off.
   * This switch only switches whether to restore layout data during initialization
   */
  private enabled = true;
  // private enabled = false;

  get openFirstWorkflow() {
    return this._openFirstWorkflow;
  }

  set openFirstWorkflow(status: boolean) {
    this._openFirstWorkflow = status;
  }

  init() {
    //
  }
  storeLayout() {
    saveLayoutData(
      this.optionsService.spaceId,
      this.optionsService.projectId,
      this.getLayoutData(),
    );
  }
  async restoreLayout() {
    // This step must be done whether persistence is required or not
    await this.addSidebarWidget();
    if (this.enabled) {
      const data = await readLayoutData(
        this.optionsService.spaceId,
        this.optionsService.projectId,
      );
      await this.setLayoutData(data || {});
    }
  }
  storeWidget() {
    //
  }
  restoreWidget() {
    //
  }

  /**
   * Generate layout data for the current IDE
   */
  getLayoutData() {
    const data: Record<string, any> = {};
    const { primarySidebar, mainPanel } = this.applicationShell;

    /**
     * Primary Sidebar Data
     * In the current specialized business, primarySidebar can only open specific widgets, so there is no need to store general widgets data here
     */
    data.primarySidebar = {
      isHidden: !!primarySidebar?.isHidden,
    };

    const mainPanelData = mainPanel.saveLayout();
    data.mainPanel = this.widgetsStringifyBFS(mainPanelData);

    return data;
  }
  async setLayoutData(data) {
    const { primarySidebar, mainPanel } = data || {};

    /**
     * PrimarySidebar panel initialization
     * 1. When the data does not exist, it means that there is no local data and needs to be opened by default.
     * 2. The data exists, and hidden is false, open by default
     * 3. Do not open in other cases
     */
    if (!primarySidebar || !primarySidebar.isHidden) {
      this.applicationShell.primarySidebar.show();
    } else {
      this.applicationShell.primarySidebar.hide();
    }

    if (mainPanel) {
      const mainPanelData = await this.widgetsParseBFS(mainPanel);
      // If no widget is opened when initializing, one is opened by default.
      // widget: tab
      // Children: split screen
      const { main } = mainPanelData || {};
      if (!main?.widgets?.length && !main?.children?.length) {
        this._openFirstWorkflow = true;
      }
      this.applicationShell.mainPanel.restoreLayout(mainPanelData);
      // FlowDockPanel requires a monitor to be mounted
      this.applicationShell.mainPanel.initWidgets();
    }
  }

  /**
   * Mount the default sidebar widget
   */
  async addSidebarWidget() {
    const widget = await this.widgetParse({
      uri: SIDEBAR_URI.toString(),
    });
    this.applicationShell.primarySidebar.addWidget(widget);
  }

  listen() {
    '{"primarySidebar":{"isHidden":false},"mainPanel":{"main":{"type":"tab-area","widgets":[{"uri":"coze-project:///workflow/7446703015509245996","title":"project_more_version","iconType":"0"},{"uri":"coze-project:///plugin/7446710920656896044","title":"头条新闻forautotest"},{"uri":"coze-project:///workflow/7446703015509377068","title":"wl_pro_to_pro_use_library_plug_462971","iconType":"0"},{"uri":"coze-project:///workflow/7446703015509311532","title":"wl_pro_to_library","iconType":"0"},{"uri":"coze-project:///workflow/7446703015509344300","title":"wl_pro_to_pro_use_library_plug","iconType":"0"}],"currentIndex":1}}}';

    const listener = () => {
      this.storeLayout();
      window.removeEventListener('unload', listener);
    };
    window.addEventListener('unload', listener);
  }

  private widgetStringify(widget: LayoutWidget) {
    if (!widget?.uri) {
      return;
    }
    const data: LayoutWidgetData = {
      uri: widget.uri.toString(),
    };

    if (isProjectIDEWidget(widget)) {
      const sub = widget.context.widget;
      const title = sub.getTitle();
      if (title) {
        data.title = title;
      }
      const iconType = sub.getIconType();
      if (iconType) {
        data.iconType = iconType;
      }
    }
    return data;
  }
  private widgetsStringify(widgets: LayoutWidget[]) {
    return widgets
      .map(widget => this.widgetStringify(widget))
      .filter(str => str?.uri && str.uri !== MAIN_PANEL_DEFAULT_URI.toString());
  }
  private widgetsStringifyBFS(data: any) {
    const bfs = next => {
      if (isPlainObject(next)) {
        return Object.keys(next).reduce((acc, key) => {
          if (key === 'widgets' && Array.isArray(next[key])) {
            acc[key] = this.widgetsStringify(next[key]);
          } else {
            acc[key] = bfs(next[key]);
          }
          return acc;
        }, {});
      } else if (Array.isArray(next)) {
        return next.map(bfs);
      }
      return next;
    };
    return bfs(data);
  }
  private async widgetParse(data) {
    const uri = new URI(data.uri);
    const factory = this.widgetManager.getFactoryFromURI(uri);
    const widget = (await this.widgetManager.getOrCreateWidgetFromURI(
      uri,
      factory,
    )) as LayoutWidget;
    if (isProjectIDEWidget(widget)) {
      const sub = widget.context.widget;
      data.title && sub.setTitle(data.title, 'normal');
      data.iconType && sub.setIconType(data.iconType);
    }
    this.viewRenderer.addReactPortal(widget);

    this.applicationShell.track(widget);
    return widget;
  }
  private async widgetsParseBFS(data) {
    const bfs = async next => {
      if (isPlainObject(next)) {
        return await Object.keys(next).reduce(async (accPromise, key) => {
          const acc = await accPromise;
          if (key === 'widgets' && Array.isArray(next[key])) {
            acc[key] = await Promise.all(
              next[key].map(w => this.widgetParse(w)),
            );
          } else {
            acc[key] = await bfs(next[key]);
          }
          return acc;
        }, Promise.resolve({}));
      } else if (Array.isArray(next)) {
        return await Promise.all(next.map(bfs));
      }
      return next;
    };
    return await bfs(data);
  }
}
