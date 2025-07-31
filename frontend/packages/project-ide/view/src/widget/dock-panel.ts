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

import {
  Emitter,
  type Event as CustomEvent,
  Disposable,
  DisposableCollection,
} from '@flowgram-adapter/common';

// import { findDropTarget } from '../utils/dock-panel';
import {
  type TabBar,
  type Widget,
  DockPanel,
  type Title,
} from '../lumino/widgets';
import { find, toArray, ArrayExt } from '../lumino/algorithm';

export const ACTIVE_TABBAR_CLASS = 'flow-tabBar-active';

type DockPanelOptions = DockPanel.IOptions & {
  disabledSplitScreen?: boolean;
  maxScreens?: number;
};

export class FlowDockPanel extends DockPanel {
  protected readonly onDidChangeCurrentEmitter = new Emitter<
    Title<Widget> | undefined
  >();

  private _options?: DockPanelOptions;

  protected _currentTitle: Title<Widget> | undefined;

  get onDidChangeCurrent(): CustomEvent<Title<Widget> | undefined> {
    return this.onDidChangeCurrentEmitter.event;
  }

  constructor(options?: DockPanelOptions) {
    super(options);
    this._options = options;
    this._onCurrentChanged = (
      sender: TabBar<Widget>,
      args: TabBar.ICurrentChangedArgs<Widget>,
    ) => {
      this.setCurrent(args.currentTitle || undefined);
      super._onCurrentChanged(sender, args);
    };
    this._onTabActivateRequested = (
      sender: TabBar<Widget>,
      args: TabBar.ITabActivateRequestedArgs<Widget>,
    ) => {
      this.setCurrent(args.title);
      super._onTabActivateRequested(sender, args);
    };
  }

  get currentTitle(): Title<Widget> | undefined {
    return this._currentTitle;
  }

  protected readonly toDisposeOnMarkAsCurrent = new DisposableCollection();

  protected readonly toDisposeWidgetRemove: Record<string, Disposable> = {};

  markActiveTabBar(title?: Title<Widget>): void {
    const tabBars = toArray(this.tabBars());
    tabBars.forEach(tabBar => tabBar.removeClass(ACTIVE_TABBAR_CLASS));
    const active = title && this.findTabBar(title);
    if (active) {
      active.addClass(ACTIVE_TABBAR_CLASS);
    } else if (tabBars.length > 0) {
      // At least one tabbar needs to be active
      tabBars[0].addClass(ACTIVE_TABBAR_CLASS);
    }
  }

  get currentTabBar(): TabBar<Widget> | undefined {
    return this._currentTitle && this.findTabBar(this._currentTitle);
  }

  override addWidget(
    widget: Widget,
    options?: DockPanel.IAddOptions & { addClickListener?: boolean },
  ): void {
    if (this.mode === 'single-document' && widget.parent === this) {
      return;
    }

    if (options?.addClickListener) {
      this.addWidgetActiveListener(widget);
    }

    super.addWidget(widget, options);
    this.markActiveTabBar(widget.title);
  }

  setCurrent(title: Title<Widget> | undefined): void {
    this.toDisposeOnMarkAsCurrent.dispose();
    title?.owner.node.focus();
    if (this._currentTitle !== title) {
      this.onDidChangeCurrentEmitter.fire(title);
    }
    this._currentTitle = title;
    this.markActiveTabBar(title);
    if (title) {
      const resetCurrent = () => this.setCurrent(undefined);
      title.owner.disposed.connect(resetCurrent);
      this.toDisposeOnMarkAsCurrent.push(
        Disposable.create(() => title.owner.disposed.disconnect(resetCurrent)),
      );
    }
  }

  public addWidgetActiveListener(widget: Widget): void {
    const listener = () => {
      if (this._currentTitle !== widget.title) {
        widget.activate();
        this.setCurrent(widget.title);
      }
    };

    widget.node.tabIndex = -1;
    this.toDisposeWidgetRemove[widget.id] = Disposable.create((): void => {
      widget.node.removeEventListener('focus', listener, true);
    });

    widget.node.addEventListener('focus', listener, true);
  }

  public initWidgets(): void {
    for (const widget of this.widgets()) {
      this.addWidgetActiveListener(widget);
    }
  }

  findTabBar(title: Title<Widget>): TabBar<Widget> | undefined {
    return find(
      this.tabBars(),
      bar => ArrayExt.firstIndexOf(bar.titles, title) > -1,
    );
  }

  handleEvent(event: Event): void {
    // Avoid dragging tabs between different dock-panels
    const dragSourceId = (event as Event & { source?: HTMLElement }).source?.id;
    const targetArea = (event.target as HTMLElement)?.closest?.(
      `#${dragSourceId}`,
    );
    if (!targetArea && event.type === 'lm-dragenter') {
      return;
    }

    // Disable split screen
    if (this._options?.disabledSplitScreen) {
      return;
    }

    super.handleEvent(event);
  }

  override activateWidget(widget: Widget): void {
    super.activateWidget(widget);
    this.markActiveTabBar(widget.title);
  }

  protected override onChildRemoved(msg: Widget.ChildMessage): void {
    super.onChildRemoved(msg);

    const dispose = this.toDisposeWidgetRemove[msg?.child?.id];
    if (dispose) {
      dispose.dispose();
    }
  }
}
export namespace FlowDockPanel {
  export const Factory = Symbol('FlowDockPanel#Factory');
  export interface Factory {
    (options?: DockPanelOptions): FlowDockPanel;
  }
}
