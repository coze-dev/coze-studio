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

import { type Root, createRoot } from 'react-dom/client';
import { decorate, inject, injectable } from 'inversify';
import { DisposableCollection } from '@flowgram-adapter/common';
import {
  Command,
  CommandService,
  ShortcutsService,
} from '@coze-project-ide/core';

import { type ReactWidget } from '../react-widget';
import { codicon } from '../../utils';
import { type CustomTitleType } from '../../types';
import { ApplicationShell } from '../../shell';
import { HoverService } from '../../services/hover-service';
import { TabBar, type Title, type Widget } from '../../lumino/widgets';
import {
  type VirtualElement,
  h,
  type ElementInlineStyle,
  hpass,
} from '../../lumino/virtualdom';
import { MenuService } from '../../contributions/context-menu';
import { DISABLE_HANDLE_EVENT, MAIN_PANEL_ID } from '../../constants';
import { createTabStyle } from './utils';

export const TabBarRendererFactory = Symbol('TabBarRendererFactory');
export type TabBarRendererFactory = () => TabBarRenderer;

/**
 * Size information of DOM elements used for rendering tabs in side bars.
 */
export interface SizeData {
  width: number;
  height: number;
}

/**
 * Extension of the rendering data used for tabs in side bars of the application shell.
 */
export interface RenderData extends TabBar.IRenderData<Widget> {
  labelSize?: SizeData;
  iconSize?: SizeData;
  paddingTop?: number;
  paddingBottom?: number;
  visible?: boolean;
}

export interface ScrollableRenderData extends TabBar.IRenderData<Widget> {
  tabWidth?: number;
}

decorate(injectable(), TabBar.Renderer);

@injectable()
export class TabBarRenderer extends TabBar.Renderer {
  protected readonly toDispose = new DisposableCollection();

  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(HoverService) hoverService: HoverService;

  @inject(ShortcutsService) shortcutsService: ShortcutsService;

  @inject(CommandService) commandService: CommandService;

  @inject(MenuService) menuService: MenuService;

  protected iconNodeRoot = new WeakMap<HTMLElement, Root>();

  protected labelNodeRoot = new WeakMap<HTMLElement, Root>();

  constructor() {
    super();
  }

  protected _tabBar?: TabBar<Widget>;

  dispose(): void {
    this.toDispose.dispose();
  }

  set tabBar(tabBar: TabBar<Widget> | undefined) {
    if (this._tabBar === tabBar) {
      return;
    }
    this._tabBar = tabBar;
  }

  get tabBar(): TabBar<Widget> | undefined {
    return this._tabBar;
  }

  override renderTab(
    data: RenderData,
    _isInSidePanel?: boolean,
    isPartOfHiddenTabBar?: boolean,
  ): VirtualElement {
    const title = data.title as CustomTitleType;

    const closeTitle = this.shortcutsService.getLabelWithShortcutUI(
      Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
    );

    const hover =
      this.tabBar &&
      this.tabBar.orientation === 'horizontal' &&
      typeof title.label === 'string'
        ? {
            onmouseenter: (e: MouseEvent) =>
              this.handleMouseEnterEvent(e, title),
          }
        : { title: title.caption };

    return h.li(
      {
        ...hover,
        key: this.createTabKey(data),
        className: this.createTabClass(data),
        id: this.createTabId(title, isPartOfHiddenTabBar),
        style: this.createTabStyle(data),
        dataset: this.createTabDataset(data),
        ondblclick: (e: MouseEvent) => this.handleDblClickEvent(e, title),
        onauxclick: (e: MouseEvent) => {
          // If user closes the tab using mouse wheel, nothing should be pasted to an active editor
          e.preventDefault();
        },
        onclick: (e: MouseEvent) => this.handleClickEvent(e, title),
        oncontextmenu: e => {
          this.menuService.open(e as unknown as React.MouseEvent, title.owner);
          e.stopPropagation();
          e.preventDefault();
        },
      },
      h.div(
        { className: 'flow-tab-icon-label' },
        this.renderIcon(data),
        this.renderLabel(data),
      ),
      h.div({
        className: title.saving
          ? `lm-TabBar-tabCloseIcon saving action-label ${DISABLE_HANDLE_EVENT}`
          : `lm-TabBar-tabCloseIcon action-label ${DISABLE_HANDLE_EVENT}`,
        onmouseenter: e => {
          e.stopPropagation();
          if (closeTitle) {
            this.hoverService.requestHover({
              content: closeTitle,
              position: 'bottom',
              target: e.target as HTMLElement,
            });
          }
        },
        onclick: e => this.handleCloseClickEvent(e, title),
        ondblclick: e => e.stopPropagation(),
      }),
    );
  }

  override createTabClass(data: RenderData): string {
    let tabClass = super.createTabClass(data);
    if (!(data.visible ?? true)) {
      tabClass += ' p-mod-invisible';
    }
    return tabClass;
  }

  protected handleClickEvent(e: MouseEvent, title?: CustomTitleType) {
    this.menuService.close();
  }

  createTabId(title: Title<Widget>, isPartOfHiddenTabBar = false): string {
    return `shell-tab-${(title.owner as ReactWidget)?.uri?.displayName}${
      isPartOfHiddenTabBar ? '-hidden' : ''
    }`;
  }

  override createTabStyle(
    data: RenderData & ScrollableRenderData,
  ): ElementInlineStyle {
    return createTabStyle(data);
  }

  override renderLabel(data: RenderData): VirtualElement {
    const { labelSize } = data;
    const { iconSize } = data;
    let width: string | undefined;
    let height: string | undefined;
    let top: string | undefined;
    if (labelSize) {
      width = `${labelSize.width}px`;
      height = `${labelSize.height}px`;
    }
    if (data.paddingTop || iconSize) {
      const iconHeight = iconSize ? iconSize.height : 0;
      let paddingTop = data.paddingTop || 0;
      if (iconHeight > 0) {
        paddingTop = paddingTop * 1.5;
      }
      top = `${paddingTop + iconHeight}px`;
    }

    const style: ElementInlineStyle = { width, height, top };

    if (typeof data.title.label === 'string') {
      // string + hoverService
      return h.div(
        { className: 'flow-TabBar-tabLabel-text', style },
        data.title.label,
      );
    } else {
      // The business side's own react component
      const virtualIconDOM = {
        render: (host: HTMLElement) => {
          const currentRoot = this.labelNodeRoot.get(host);
          if (currentRoot) {
            currentRoot.render(data.title.label);
          } else {
            const root = createRoot(host);
            root.render(data.title.label);
            this.labelNodeRoot.set(host, root);
          }
        },
        unrender: (host: HTMLElement) => {
          const currentRoot = this.labelNodeRoot.get(host);
          if (currentRoot) {
            currentRoot.unmount();
            this.labelNodeRoot.delete(host);
          }
        },
      };
      return hpass(
        'div',
        { className: 'flow-TabBar-tabLabel', style },
        virtualIconDOM,
      );
    }
  }

  override renderIcon(data: RenderData): VirtualElement {
    if (!data.title.iconLabel) {
      return h.div();
    }
    let top: string | undefined;
    if (data.paddingTop) {
      top = `${data.paddingTop || 0}px`;
    }
    const style: ElementInlineStyle = { top };
    const baseClassName = this.createIconClass(data);

    if (typeof data.title.iconLabel === 'string') {
      // Using vscode iconClass
      return h.i({ className: codicon(data.title.iconLabel) });
    } else {
      // The business side's own react component
      const virtualIconDOM = {
        render: (host: HTMLElement) => {
          const currentRoot = this.iconNodeRoot.get(host);
          if (currentRoot) {
            currentRoot.render(data.title.iconLabel);
          } else {
            const root = createRoot(host);
            this.iconNodeRoot.set(host, root);
            root.render(data.title.iconLabel);
          }
        },
        unrender: (host: HTMLElement) => {
          const currentRoot = this.labelNodeRoot.get(host);
          if (currentRoot) {
            currentRoot.unmount();
            this.labelNodeRoot.delete(host);
          }
        },
      };
      return hpass('div', { className: baseClassName, style }, virtualIconDOM);
    }
  }

  protected handleMouseEnterEvent = (
    event: MouseEvent,
    title?: CustomTitleType,
  ) => {
    if (
      this.tabBar &&
      this.hoverService &&
      event.currentTarget instanceof HTMLElement
    ) {
      if (title) {
        const label = title.label || title.caption;
        if (this.tabBar.orientation === 'horizontal') {
          // Old preview
          // this.hoverService.requestHover({
          //   content: this.renderEnhancedPreview(title),
          //   target: event.currentTarget,
          //   position: 'bottom',
          //   cssClasses: ['extended-tab-preview'],
          //   visualPreview: width => this.renderVisualPreview(width, title),
          // });
          // Using an external tooltip component
          label &&
            this.hoverService.requestHover({
              content: label,
              target: event.currentTarget,
              position: 'bottom',
            });
        } else {
          label &&
            this.hoverService.requestHover({
              content: label,
              target: event.currentTarget,
              position: 'right',
            });
        }
      }
    }
  };

  protected handleCloseClickEvent = (
    event: MouseEvent,
    title?: CustomTitleType,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (this.tabBar && event.currentTarget instanceof HTMLElement) {
      if ((title as CustomTitleType)?.saving) {
        this.commandService.executeCommand(
          Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM,
          [title],
        );
        // Save close prompt
      } else {
        title?.owner.close();
      }
    }
  };

  protected handleDblClickEvent = (
    event: MouseEvent,
    title?: CustomTitleType,
  ) => {
    // Disable full screen when disabling tab double-clicking to trigger full screen
    if (this.shell.disableFullScreen) {
      return;
    }
    const isMainPanel = title?.owner?.parent?.id === MAIN_PANEL_ID;
    // The main editing area will only trigger full screen.
    if (
      this.tabBar &&
      event.currentTarget instanceof HTMLElement &&
      isMainPanel
    ) {
      this.commandService.executeCommand(Command.Default.VIEW_FULL_SCREEN);
    }
  };
}
