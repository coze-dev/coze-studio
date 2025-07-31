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

import React from 'react';

import { type interfaces } from 'inversify';

// import { bindContributionProvider } from '@flowgram-adapter/common';
import {
  bindContributionProvider,
  bindContributions,
} from '@flowgram-adapter/common';
import {
  CommandContribution,
  definePluginCreator,
  IDERendererProvider,
  OpenHandler,
  ShortcutsContribution,
  StylingContribution,
  EventService,
  Command,
  domEditable,
} from '@coze-project-ide/core';

import { WidgetManager } from './widget-manager';
import { WidgetOpenHandler } from './widget/widget-open-handler';
import { WidgetFactory } from './widget/widget-factory';
import { TabBarToolbar, TabBarToolbarFactory } from './widget/tab-bar/toolbar';
import {
  TabBarRenderer,
  TabBarRendererFactory,
} from './widget/tab-bar/tab-renderer';
import { CustomTabBar, TabBarFactory } from './widget/tab-bar/custom-tabbar';
import { DebugBarWidget } from './widget/react-widgets/debug-bar-widget';
import {
  CustomRenderWidget,
  CustomRenderWidgetFactory,
} from './widget/react-widgets/custom-render-widget-factory';
import { type ReactWidget } from './widget/react-widget';
import {
  SidePanelHandler,
  SidePanelHandlerFactory,
} from './widget/handlers/side-panel-handler';
import { DockPanelRendererFactory } from './widget/dock-panel-renderer-factory';
import { DockPanelRenderer } from './widget/dock-panel-renderer';
import { FlowDockPanel } from './widget/dock-panel';
import { ViewRenderer } from './view-renderer';
import { ViewManager } from './view-manager';
import { type ViewPluginOptions, type ToolbarAlign } from './types';
import {
  ApplicationShell,
  CustomPreferenceContribution,
  LayoutRestorer,
} from './shell';
import { ViewService } from './services/view-service';
import { HoverService } from './services/hover-service';
import { DragService } from './services/drag-service';
import { DebugService } from './services/debug-service';
import { type DockPanel } from './lumino/widgets';
import { MenuService } from './contributions/context-menu';
import {
  bindActivityBarView,
  ViewCommonContribution,
  ViewContribution,
} from './contributions';
import { ViewOptions } from './constants/view-options';
import { MAIN_PANEL_ID } from './constants';
const DefaultFallbackRender = () => <div>Something went wrong.</div>;

/**
 * Point background plugin
 */
export const createViewPlugin = definePluginCreator<ViewPluginOptions>({
  onBind: ({ bind }, opts) => {
    bind(ViewManager).toSelf().inSingletonScope();
    bind(WidgetManager).toSelf().inSingletonScope();
    bind(ViewRenderer).toSelf().inSingletonScope();

    bind(ViewOptions).toConstantValue({
      widgetFallbackRender: DefaultFallbackRender,
      ...opts,
    });

    bind(ApplicationShell).toSelf().inSingletonScope();
    bind(LayoutRestorer).toSelf().inSingletonScope();
    bindContributionProvider(bind, WidgetFactory);
    bindContributionProvider(bind, ViewContribution);
    bindContributionProvider(bind, CustomPreferenceContribution);
    bindContributions(bind, WidgetOpenHandler, [OpenHandler]);

    bind(HoverService).toSelf().inSingletonScope();
    bind(DragService).toSelf().inSingletonScope();
    bind(ViewService).toSelf().inSingletonScope();
    bind(DebugService).toSelf().inSingletonScope();
    bind(DebugBarWidget).toSelf().inSingletonScope();

    bind(SidePanelHandlerFactory).toAutoFactory(SidePanelHandler);
    bind(SidePanelHandler).toSelf();

    bind(CustomRenderWidgetFactory).toFactory(
      _context => (childContainer: interfaces.Container) => {
        childContainer.bind(CustomRenderWidget).toSelf().inSingletonScope();
        return childContainer.get(CustomRenderWidget);
      },
    );

    bind(DockPanelRendererFactory).toFactory(context => () => {
      const childContainer = context.container.createChild();
      childContainer.bind(DockPanelRenderer).toSelf().inSingletonScope();
      childContainer.bind(CustomTabBar).toSelf().inSingletonScope();
      childContainer.bind(TabBarFactory).toFactory(context => () => {
        const container = context.container.createChild();
        container.bind(CustomTabBar).toSelf().inSingletonScope();
        return container.get(CustomTabBar);
      });
      childContainer
        .bind(TabBarToolbarFactory)
        .toFactory(context => (align?: ToolbarAlign) => {
          const container = context.container.createChild();
          container.bind(TabBarToolbar).toSelf().inSingletonScope();
          const toolbar = container.get(TabBarToolbar);
          toolbar.initAlign(align);
          return toolbar;
        });
      childContainer.bind(TabBarRendererFactory).toFactory(context => () => {
        const container = context.container.createChild();
        container.bind(TabBarRenderer).toSelf().inSingletonScope();
        return container.get(TabBarRenderer);
      });
      return childContainer.get(DockPanelRenderer);
    });

    bind(IDERendererProvider)
      .toDynamicValue(ctx => {
        const shell = ctx.container.get(ApplicationShell);
        return ctx.container.get(ViewRenderer).toReactComponent(shell);
      })
      .inSingletonScope();

    bindContributions(bind, ViewCommonContribution, [
      CommandContribution,
      StylingContribution,
      ShortcutsContribution,
    ]);

    bind(FlowDockPanel.Factory).toFactory(
      () => (options?: DockPanel.IOptions) => new FlowDockPanel(options),
    );

    bindActivityBarView(bind);
  },

  onInit: async (ctx, opts) => {
    const viewManager = ctx.get<ViewManager>(ViewManager);
    await viewManager.init(opts);
  },
  // After the page is rendered, attach dom
  onLayoutInit: async (ctx, opts) => {
    // contextmenu
    if (!opts.presetConfig?.disableContextMenu) {
      const menuService = ctx.container.get<MenuService>(MenuService);
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_ALL_WIDGET,
        selector: '.lm-TabBar-tab',
      });
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_OTHER_WIDGET,
        selector: '.lm-TabBar-tab',
      });
      menuService.addMenuItem({
        command: Command.Default.VIEW_FULL_SCREEN,
        selector: '.lm-TabBar-tab',
        filter: (widget: ReactWidget) => {
          const isMainPanel = widget?.parent?.id === MAIN_PANEL_ID;
          return isMainPanel;
        },
      });
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
        selector: '.lm-TabBar-tab',
      });
    }
    const viewManager = ctx.get<ViewManager>(ViewManager);
    await viewManager.attach(opts);
    const eventService = ctx.container.get<EventService>(EventService);
    const menuService = ctx.container.get<MenuService>(MenuService);
    // Hijack the global contextmenu
    eventService.listenGlobalEvent('contextmenu', (e: React.MouseEvent) => {
      if (domEditable(e.target as HTMLElement)) {
        return;
      }
      const hasMenu = menuService.open(e);
      if (!opts.presetConfig?.disableContextMenu || hasMenu) {
        // Always block right button inside IDE
        e.stopPropagation();
        e.preventDefault();
      }
    });
  },
  onDispose: ctx => {
    const layoutRestorer = ctx.get<LayoutRestorer>(LayoutRestorer);
    layoutRestorer.storeLayout();
  },
});
