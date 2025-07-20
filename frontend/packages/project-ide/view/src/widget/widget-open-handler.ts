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
import { type OpenHandler, type URI } from '@coze-project-ide/core';

import { WidgetManager } from '../widget-manager';
import { ViewRenderer } from '../view-renderer';
import { LayoutPanelType } from '../types';
import { LayoutRestorer } from '../shell/layout-restorer';
import { ApplicationShell } from '../shell';
import { type Panel } from '../lumino/widgets';
import { PANEL_CLASS_NAME_MAP } from '../constants';
import { type FlowDockPanel } from './dock-panel';

@injectable()
export class WidgetOpenHandler implements OpenHandler {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  @inject(WidgetManager) widgetManager: WidgetManager;

  @inject(LayoutRestorer) layoutRestorer: LayoutRestorer;

  canHandle() {
    return 1;
  }

  protected async hidePanelArea(area: LayoutPanelType) {
    const panelWidget = await this.widgetManager.getWidget(
      PANEL_CLASS_NAME_MAP[area].toString(),
    );
    (panelWidget as Panel)?.widgets?.forEach?.(widget => widget.hide());
  }

  protected async bindWidget(uri: URI) {
    const factory = this.widgetManager.getFactoryFromURI(uri)!;
    const widget = await this.widgetManager.getOrCreateWidgetFromURI(
      uri,
      factory,
    );
    const area = factory.area || LayoutPanelType.MAIN_PANEL;
    this.viewRenderer.addReactPortal(widget);
    return {
      widget,
      area,
    };
  }

  async open(uri: URI, options?: any) {
    const { widget, area } = await this.bindWidget(uri);

    if (
      [LayoutPanelType.MAIN_PANEL, LayoutPanelType.BOTTOM_PANEL].includes(area)
    ) {
      if (!widget.isAttached) {
        this.shell.addWidget(widget, {
          ...options,
          area,
        });
        /** 创建 widget 时尝试从内存中恢复状态 */
        this.layoutRestorer.restoreWidget(widget);
        /** 监听销毁时尝试保存状态到内存中 */
        widget.onDispose(() => this.layoutRestorer.storeWidget(widget));
      }
      widget.parent?.show();
      /**
       * 如果打开的是 bottom，并且底部比较打开的不够高则自动打开一定高度
       */
      if (
        area === LayoutPanelType.BOTTOM_PANEL &&
        this.shell.bottomSplitLayout.absoluteSizes()[1] < 26
      ) {
        this.shell.bottomSplitLayout.setRelativeSizes([0.7, 0.3]);
      }
      widget.uri = uri;
      (widget.parent as FlowDockPanel)?.activateWidget(widget);
      // (widget.parent as FlowDockPanel)?.setCurrent(widget.title);
      widget.onOpenRequest?.(uri, options);

      return;
    }

    if (!widget.isAttached) {
      await this.hidePanelArea(area);
      this.shell.addWidget(widget, {
        area,
      });
      widget.parent?.show();
    } else {
      if (widget.parent?.isHidden) {
        widget.parent.show();
      }
      if (
        !widget.isHidden &&
        (area === LayoutPanelType.PRIMARY_SIDEBAR ||
          area === LayoutPanelType.SECONDARY_SIDEBAR)
      ) {
        widget.parent?.hide();
        await this.hidePanelArea(area);
        return;
      }
      await this.hidePanelArea(area);
      widget.uri = uri;
      widget.onOpenRequest?.(uri, options);

      // 区域唯一展示
      widget.show();
    }
  }
}
