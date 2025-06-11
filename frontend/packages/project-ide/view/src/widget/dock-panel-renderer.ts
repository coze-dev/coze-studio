import { inject, injectable } from 'inversify';

import {
  type DockLayout,
  DockPanel,
  type TabBar,
  type Widget,
} from '../lumino/widgets';

// import { TabRenderer } from './tab-bar/tab-renderer';
import { CustomTabBar, TabBarFactory } from './tab-bar/custom-tabbar';
import { FlowDockPanel } from './dock-panel';

@injectable()
export class DockPanelRenderer implements DockLayout.IRenderer {
  @inject(FlowDockPanel.Factory)
  protected readonly dockPanelFactory: FlowDockPanel.Factory;

  @inject(CustomTabBar) customTabBar: CustomTabBar;

  readonly tabBarClasses: string[] = [];

  constructor(
    @inject(TabBarFactory)
    protected tabBarFactory: TabBarFactory,
  ) {}

  createTabBar(): TabBar<Widget> {
    const newTab = this.tabBarFactory();
    return newTab;
  }

  createHandle(): HTMLDivElement {
    return DockPanel.defaultRenderer.createHandle();
  }
}
