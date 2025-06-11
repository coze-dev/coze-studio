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
      this.markAsCurrent(args.currentTitle || undefined);
      super._onCurrentChanged(sender, args);
    };
    this._onTabActivateRequested = (
      sender: TabBar<Widget>,
      args: TabBar.ITabActivateRequestedArgs<Widget>,
    ) => {
      this.markAsCurrent(args.title);
      super._onTabActivateRequested(sender, args);
    };
  }

  protected _currentTitle: Title<Widget> | undefined;

  get currentTitle(): Title<Widget> | undefined {
    return this._currentTitle;
  }

  get currentTabBar(): TabBar<Widget> | undefined {
    return this._currentTitle && this.findTabBar(this._currentTitle);
  }

  findTabBar(title: Title<Widget>): TabBar<Widget> | undefined {
    return find(
      this.tabBars(),
      bar => ArrayExt.firstIndexOf(bar.titles, title) > -1,
    );
  }

  protected readonly toDisposeOnMarkAsCurrent = new DisposableCollection();

  protected readonly toDisposeWidgetRemove: Record<string, Disposable> = {};

  markAsCurrent(title: Title<Widget> | undefined): void {
    this.toDisposeOnMarkAsCurrent.dispose();
    title?.owner.node.focus();
    if (this._currentTitle !== title) {
      this.onDidChangeCurrentEmitter.fire(title);
    }
    this._currentTitle = title;
    this.markActiveTabBar(title);
    if (title) {
      const resetCurrent = () => this.markAsCurrent(undefined);
      title.owner.disposed.connect(resetCurrent);
      this.toDisposeOnMarkAsCurrent.push(
        Disposable.create(() => title.owner.disposed.disconnect(resetCurrent)),
      );
    }
  }

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

  public addWidgetActiveListener(widget: Widget): void {
    const listener = () => {
      if (this._currentTitle !== widget.title) {
        widget.activate();
        this.markAsCurrent(widget.title);
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

  handleEvent(event: Event): void {
    // 避免不同 dock-panel 之间的 tab 相互拖拽
    const dragSourceId = (event as Event & { source?: HTMLElement }).source?.id;
    const targetArea = (event.target as HTMLElement)?.closest?.(
      `#${dragSourceId}`,
    );
    if (!targetArea && event.type === 'lm-dragenter') {
      return;
    }

    // 禁止分屏
    if (this._options?.disabledSplitScreen) {
      return;
    }
    // 最大分屏数限制逻辑，注释保留暂存
    // // 访问 DockLayout 中的 private 属性 _edges、_items，临时使用 any 类型
    // // TODO：lumino 迁移本地可以改属性形态
    // if (['lm-dragenter', 'lm-dragover'].includes(event.type)) {
    //   const { clientX, clientY } = event as DragEvent;
    //   const { zone } = findDropTarget(this, clientX, clientY, (this as any)._edges);
    //   const items = (this.layout as any)?._items || {};
    //   const visibleSize = Array.from(items).filter(([key]: any) => key?.isVisible)?.length;
    //   if (
    //     this._options?.maxScreens &&
    //     zone !== 'widget-tab' &&
    //     // tab + content widget size * 2
    //     visibleSize >= this._options?.maxScreens * 2
    //   ) {
    //     return;
    //   }
    // }
    super.handleEvent(event);
  }

  override activateWidget(widget: Widget): void {
    super.activateWidget(widget);
    this.markActiveTabBar(widget.title);
  }

  protected override onChildRemoved(msg: Widget.ChildMessage): void {
    super.onChildRemoved(msg);

    const dispose = this.toDisposeWidgetRemove[msg.child.id];
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
