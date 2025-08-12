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
