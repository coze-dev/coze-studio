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

import { type ReactWidget } from '../react-widget';
import { ViewRenderer } from '../../view-renderer';
import { ToolbarAlign } from '../../types';
import { TabBar, Widget } from '../../lumino/widgets';
import { type Message } from '../../lumino/messaging';
import {
  CUSTOM_TAB_BAR_CONTAINER,
  DISABLE_HANDLE_EVENT,
  PRE_TAB_BAR_ACTION_CONTAINER,
  TAB_BAR_ACTION_CONTAINER,
  TAB_BAR_SCROLL_CONTAINER,
} from '../../constants';
import PerfectScrollbar from '../../components/scroll-bar';
import { type TabBarToolbar, TabBarToolbarFactory } from './toolbar';
import { TabBarRendererFactory } from './tab-renderer';

export const TabBarFactory = Symbol('TabBarRendererFactory');
export type TabBarFactory = () => CustomTabBar;

@injectable()
export class CustomTabBar extends TabBar<Widget> {
  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  protected scrollBar?: PerfectScrollbar;

  protected scrollBarFactory: () => PerfectScrollbar;

  preToolbar: TabBarToolbar;

  toolbar: TabBarToolbar;

  protected scrollContainer: HTMLElement;

  protected preActionContainer: HTMLElement;

  protected actionContainer: HTMLElement;

  constructor(
    @inject(TabBarToolbarFactory)
    protected tabBarToolbarFactory: TabBarToolbarFactory,
    @inject(TabBarRendererFactory) tabbarRendererFactory: TabBarRendererFactory,
    renderer = tabbarRendererFactory(),
  ) {
    super({
      renderer,
    });
    this.rewrireDOM();
    this.preToolbar = this.tabBarToolbarFactory(ToolbarAlign.LEADING);
    this.toolbar = this.tabBarToolbarFactory();
    this.preToolbar.tabBar = this;
    this.toolbar.tabBar = this;
    renderer.tabBar = this;

    this.currentChanged.connect(() => {
      const uri = (this.currentTitle?.owner as ReactWidget).getResourceURI();
      if (uri) {
        this.preToolbar.updateURI(uri);
        this.toolbar.updateURI(uri);
      }
    });

    this.scrollBarFactory = () =>
      new PerfectScrollbar(this.scrollContainer, {
        // Compatible scrolling in mouse mode
        useBothWheelAxes: true,
        suppressScrollY: true,
      });
  }

  protected getHandleEvent(ele?: HTMLElement | null): boolean {
    if (!ele || ele.classList.contains(TAB_BAR_SCROLL_CONTAINER)) {
      return true;
    }

    if (ele.classList.contains('flow-toolbar-item')) {
      return false;
    }
    if (ele.classList.contains('flow-toolbar-container')) {
      return false;
    }
    if (ele.classList.contains(DISABLE_HANDLE_EVENT)) {
      return false;
    }

    return this.getHandleEvent(ele.parentElement);
  }

  handleEvent(event: Event): void {
    const canSuperHandle = this.getHandleEvent(event.target as HTMLElement);

    // Cannot block pointerup, otherwise the toolbar display will trigger split-screen drag
    if (canSuperHandle || event.type === 'pointerup') {
      super.handleEvent(event);
    }
  }

  rewrireDOM() {
    const { contentNode } = this;
    if (!contentNode) {
      throw new Error(
        "'this.node' does not have the content as a direct child with class name 'p-TabBar-content'.",
      );
    }
    this.node.removeChild(contentNode);
    const contentContainer = document.createElement('div');
    contentContainer.classList.add(CUSTOM_TAB_BAR_CONTAINER);
    this.preActionContainer = document.createElement('div');
    this.preActionContainer.classList.add(PRE_TAB_BAR_ACTION_CONTAINER);
    contentContainer.appendChild(this.preActionContainer);

    this.scrollContainer = document.createElement('div');
    this.scrollContainer.classList.add(TAB_BAR_SCROLL_CONTAINER);
    contentContainer.appendChild(this.scrollContainer);
    this.scrollContainer.appendChild(contentNode);

    this.actionContainer = document.createElement('div');
    this.actionContainer.classList.add(TAB_BAR_ACTION_CONTAINER);
    contentContainer.appendChild(this.actionContainer);
    this.node.appendChild(contentContainer);
  }

  protected override onResize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    this.scrollBar?.update();
  }

  protected override onAfterAttach(msg: Message): void {
    if (!this.scrollBar) {
      this.scrollBar = this.scrollBarFactory();
    }
    if (this.toolbar) {
      if (this.toolbar.isAttached) {
        Widget.detach(this.toolbar);
      }
      Widget.attach(this.toolbar, this.actionContainer);
      this.viewRenderer.addReactPortal(this.toolbar);
    }
    if (this.preActionContainer) {
      if (this.preToolbar.isAttached) {
        Widget.detach(this.preToolbar);
      }
      Widget.attach(this.preToolbar, this.preActionContainer);
      this.viewRenderer.addReactPortal(this.preToolbar);
    }
    super.onAfterAttach(msg);
  }

  protected onBeforeDetach(msg: Message): void {
    if (this.toolbar && this.toolbar.isAttached) {
      Widget.detach(this.toolbar);
    }
    if (this.preToolbar && this.preToolbar.isAttached) {
      Widget.detach(this.preToolbar);
    }
    super.onBeforeDetach(msg);
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.scrollBar?.update();
  }
}
