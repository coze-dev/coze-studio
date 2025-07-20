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

// 展开状态 className
const EXPAND_CLASSNAME = 'expand';
// 关闭状态 className
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
   * 存在表示启用内部分区
   * 使用 Orientation 标明布局分割方向
   * 水平 - horizontal
   * 垂直 - vertical
   */
  private _orientation: SplitLayout.Orientation | undefined;

  /** 默认布局，初始化子面板的时候使用该布局 */
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
   * 所有分区面板
   */
  protected panels: Panel[] = [];

  contentPanel: SplitPanel;

  splitPanels: SplitPanelType[] = [];

  /**
   * 方向
   */
  direction?: BoxLayout.Direction = 'left-to-right';

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    // 水平布局生效
    if (!this.panels?.length || this.orientation !== 'horizontal') {
      return;
    }
    /**
     * 修复 lumino 原生问题
     * 劫持 fit 方法，当面板 close 的时候移除前一个 handler
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
   * 初始化 panel node className
   */
  addClassNames() {
    // 数据不存在的时候不执行 classname 逻辑
    if (!this.storeData?.panelClose) {
      return;
    }
    this.panels.forEach((_, idx) => {
      // 1. 默认 expand 状态
      // 2. storeData 存储状态为 close 时初始化为 close
      const isExpand = !this.storeData?.panelClose?.[idx];
      if (!isExpand) {
        this.closePanel(idx);
      } else {
        this.expandPanel(idx);
      }
    });
  }

  /**
   * 根据 uri 获取 widget
   */
  getWidget(uri: URI) {
    const id = this.widgetManager.uriToWidgetID(uri);
    return this.widgetManager.getWidget(id);
  }

  /**
   * 根据 widget uri 获取 expand 状态
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
   * 创建 panel
   */
  protected async createPanels(stretch: number[]) {
    this.splitPanels.sort(
      (prev, next) => (prev.order || 0) - (next.order || 0),
    );
    return Promise.all(
      this.splitPanels.map(async ({ widgetUri, widget }, idx) => {
        const panel = this.createPanel(widgetUri);
        // 面板关闭状态
        if (stretch?.[idx] === 0) {
          panel.node.classList.add(CLOSE_CLASSNAME);
        } else {
          // 默认 expand
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
   * 通过 uri 展开 / 收起子面板
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
        // 执行 close panel
        // 隐藏 handler，避免关闭 panel 调整。
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

  /** 通过 relativeSizes 直接控制面板开关 */
  /**
   * 为什么 RelativeSizes 不直接和 expand 状态绑定：
   * 面板关闭状态下可能默认展示标题高度，无法根据 relativeSizes 直接判断
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

  /** 默认初始化分区布局 */
  protected getDefaultStretch() {
    // 从默认配置中取
    if (this.defaultStretch) {
      return this.defaultStretch;
    }
    const panelsLength = this.panels.length;
    const splitStretch = new Array(panelsLength).fill(1 / panelsLength);
    return splitStretch;
  }

  /**
   * 创建 container
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
   * 默认不渲染
   */
  render(): ReactElementType {
    return null;
  }
}
