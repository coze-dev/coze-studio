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
import { type AsClass } from '@flowgram-adapter/common';
import { type URI } from '@coze-project-ide/core';

import { ReactWidget } from '../react-widget';
import { WidgetManager } from '../../widget-manager';
import { ViewRenderer } from '../../view-renderer';
import { createSplitLayout, createBoxLayout } from '../../utils/layout';
import { type ReactElementType } from '../../types/view';
import {
  LayoutRestorer,
  type StatefulWidget,
} from '../../shell/layout-restorer';
import {
  type BoxLayout,
  Panel,
  type SplitLayout,
  SplitPanel,
} from '../../lumino/widgets';
import { type Message } from '../../lumino/messaging';
import { SPLIT_PANEL_CLASSNAME } from '../../constants/view';

// Expand state className
const EXPAND_CLASSNAME = 'expand';
// Close state className
const CLOSE_CLASSNAME = 'close';

export interface SplitPanelType {
  widgetUri: URI;
  widget: AsClass<ReactWidget>;
  order: number;
}

interface StoreData {
  sizes: number[];
  panelClose: boolean[];
}

@injectable()
export abstract class SplitWidget
  extends ReactWidget
  implements StatefulWidget
{
  @inject(WidgetManager) protected widgetManager: WidgetManager;

  @inject(ViewRenderer) protected viewRenderer: ViewRenderer;

  @inject(LayoutRestorer) protected layoutRestorer: LayoutRestorer;

  /**
   * Presence indicates that internal partitioning is enabled
   * Use Orientation to indicate the layout split direction
   * Horizontal - horizontal
   * Vertical - vertical
   */
  private _orientation: SplitLayout.Orientation | undefined;

  /** Default layout, used when initializing subpanels */
  private _defaultStretch?: number[];

  get defaultStretch() {
    return this._defaultStretch;
  }

  set defaultStretch(stretch: number[] | undefined) {
    this._defaultStretch = stretch;
  }

  get orientation() {
    return this._orientation;
  }

  set orientation(orientation: SplitLayout.Orientation | undefined) {
    this._orientation = orientation;
  }

  storeData: StoreData;

  storeState(): StoreData | undefined {
    if (!this.splitPanels?.length) {
      return;
    }
    return {
      sizes: this.getRelativeSizes(),
      panelClose: this.panels.map(panel =>
        panel.node.classList.contains(CLOSE_CLASSNAME),
      ),
    };
  }

  restoreState(state: StoreData): void {
    if (!this.splitPanels?.length) {
      return;
    }
    this.storeData = state;
    this.addClassNames();
  }

  /**
   * All partition panels
   */
  protected panels: Panel[] = [];

  contentPanel: SplitPanel;

  splitPanels: SplitPanelType[] = [];

  /**
   * direction
   */
  direction?: BoxLayout.Direction = 'left-to-right';

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    // Horizontal layout takes effect
    if (!this.panels?.length || this.orientation !== 'horizontal') {
      return;
    }
    /**
     * Fix lumino native issues
     * Hijack the fit method, remove the previous handler when the panel is closed
     */
    this.panels.forEach(panel => {
      const panelDom = panel?.node;
      if (panelDom) {
        if (panelDom?.classList?.contains?.('close')) {
          (panelDom.previousSibling as HTMLElement)?.classList?.add?.(
            'lm-mod-hidden',
          );
        } else {
          (panelDom.previousSibling as HTMLElement)?.classList?.remove?.(
            'lm-mod-hidden',
          );
        }
      }
    });
  }

  init(uri: URI) {
    super.init(uri);
    if (!this.splitPanels?.length) {
      return;
    }
    if (!this.layout) {
      this.createContainer();
    }
  }

  protected createPanel(uri: URI): Panel {
    const panel = new Panel();
    panel.id = uri.displayName;
    return panel;
  }

  /**
   * Initialize panel node className
   */
  addClassNames() {
    // Does not execute classname logic when data does not exist
    if (!this.storeData?.panelClose) {
      return;
    }
    this.panels.forEach((_, idx) => {
      // 1. Default expand state
      // 2. storeData is initialized to close when the storage state is closed
      const isExpand = !this.storeData?.panelClose?.[idx];
      if (!isExpand) {
        this.closePanel(idx);
      } else {
        this.expandPanel(idx);
      }
    });
  }

  /**
   * Get widget by URI
   */
  getWidget(uri: URI) {
    const id = this.widgetManager.uriToWidgetID(uri);
    return this.widgetManager.getWidget(id);
  }

  /**
   * Get expanded state according to widget uri
   */
  getWidgetExpand(uri?: URI): boolean {
    if (!uri) {
      return false;
    }
    const id = this.widgetManager.uriToWidgetID(uri);
    const widget = this.widgetManager.getWidget(id);
    return Boolean(widget?.parent?.node.classList.contains('expand'));
  }

  /**
   * Create panel
   */
  protected async createPanels(stretch: number[]) {
    this.splitPanels.sort(
      (prev, next) => (prev.order || 0) - (next.order || 0),
    );
    return Promise.all(
      this.splitPanels.map(async ({ widgetUri, widget }, idx) => {
        const panel = this.createPanel(widgetUri);
        // Panel closed status
        if (stretch?.[idx] === 0) {
          panel.node.classList.add(CLOSE_CLASSNAME);
        } else {
          // Default expand
          panel.node.classList.add(EXPAND_CLASSNAME);
        }
        let panelWidget;
        panelWidget = this.getWidget(widgetUri);
        if (panelWidget) {
          return panelWidget;
        } else {
          panelWidget = await this.widgetManager.createSubWidget(
            widgetUri,
            widget,
          );
          panelWidget.wrapperWidget = this;
          this.viewRenderer.addReactPortal(panelWidget);
        }
        if (widget) {
          panel.addWidget(panelWidget);
        }
        this.panels.push(panel);
      }),
    );
  }

  /**
   * Expand/retract subpanels via URI
   */
  toggleSubWidget(uri?: URI) {
    if (!uri || !this.layout) {
      return;
    }
    const relativeSizes = this.contentPanel.relativeSizes();
    const expandIdx = this.panels.findIndex(
      panel => panel.id === uri.displayName,
    );
    // const handlers = this.contentPanel.node.querySelectorAll('.lm-SplitPanel-handle');
    this.panels.forEach((panel, idx) => {
      // const currentHandler = handlers[idx];
      const isExpand = panel.node.classList.contains(EXPAND_CLASSNAME);
      if (idx === expandIdx && isExpand) {
        // Execute close panel
        // Hide handlers to avoid closing panel adjustments.
        // currentHandler.classList.add('lm-mod-hidden');
        relativeSizes[idx] = 0;
        panel.node.classList.remove(EXPAND_CLASSNAME);
        panel.node.classList.add(CLOSE_CLASSNAME);
        this.contentPanel.fit();
        this.setRelativeSizes(relativeSizes);
      } else if (idx === expandIdx && !isExpand) {
        // currentHandler.classList.remove('lm-mod-hidden');
        relativeSizes[idx] = 1;
        panel.node.classList.remove(CLOSE_CLASSNAME);
        panel.node.classList.add(EXPAND_CLASSNAME);
        this.contentPanel.fit();
        this.setRelativeSizes(relativeSizes);
      }
    });
  }

  getRelativeSizes() {
    return this.contentPanel.relativeSizes();
  }

  closePanel(idx: number) {
    const panel = this.panels[idx];
    if (!panel) {
      return;
    }
    if (panel.node.classList.contains(CLOSE_CLASSNAME)) {
      return;
    }
    panel.node.classList.remove(EXPAND_CLASSNAME);
    panel.node.classList.add(CLOSE_CLASSNAME);
  }

  expandPanel(idx: number) {
    const panel = this.panels[idx];
    if (!panel) {
      return;
    }
    if (panel.node.classList.contains(EXPAND_CLASSNAME)) {
      return;
    }
    panel.node.classList.remove(CLOSE_CLASSNAME);
    panel.node.classList.add(EXPAND_CLASSNAME);
  }

  /** Direct control panel switches via relativeSizes */
  /**
   * Why RelativeSizes is not directly bound to the expand state:
   * When the panel is closed, the title height may be displayed by default, which cannot be directly judged according to relativeSizes.
   */
  syncPanelRelativeSizes(sizes: number[]) {
    this.contentPanel.setRelativeSizes(sizes);
    if (sizes?.length) {
      sizes.forEach((size, idx) => {
        if (size === 0) {
          this.closePanel(idx);
        } else {
          this.expandPanel(idx);
        }
      });
      this.contentPanel.fit();
    }
  }

  setRelativeSizes(sizes: number[]) {
    this.contentPanel.setRelativeSizes(sizes);
  }

  /** Default initialization of partition layout */
  protected getDefaultStretch() {
    // From the default configuration
    if (this.defaultStretch) {
      return this.defaultStretch;
    }
    const panelsLength = this.panels.length;
    const splitStretch = new Array(panelsLength).fill(1 / panelsLength);
    return splitStretch;
  }

  /**
   * Create container
   */
  protected async createContainer() {
    const stretch = this.getDefaultStretch();
    await this.createPanels(stretch);
    const contentLayout = createSplitLayout(this.panels, stretch, {
      orientation: this.orientation,
      spacing: 0,
    });
    const contentPanel = new SplitPanel({ layout: contentLayout });
    contentPanel.addClass(SPLIT_PANEL_CLASSNAME);
    this.contentPanel = contentPanel;
    this.setRelativeSizes(this.storeData?.sizes || stretch);
    this.layout = createBoxLayout([this.contentPanel], [1], {
      direction: this.direction,
      spacing: 0,
    });
  }

  /**
   * Default does not render
   */
  render(): ReactElementType {
    return null;
  }
}
