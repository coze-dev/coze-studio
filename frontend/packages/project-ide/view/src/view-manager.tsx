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

import { mergeWith } from 'lodash';
import { inject, injectable, named } from 'inversify';
import { ContributionProvider } from '@flowgram-adapter/common';
import { OpenerService } from '@coze-project-ide/core';

import { WidgetManager } from './widget-manager';
import { DebugBarWidget } from './widget/react-widgets/debug-bar-widget';
import { ViewRenderer } from './view-renderer';
import { LayoutPanelType, type ViewPluginOptions } from './types';
import { ApplicationShell, LayoutRestorer } from './shell';
import { ViewContribution } from './contributions/view-contribution';
import { ViewOptions } from './constants/view-options';

@injectable()
export class ViewManager {
  @inject(ContributionProvider)
  @named(ViewContribution)
  viewContributions: ContributionProvider<ViewContribution>;

  // Injection via widgetManager
  @inject(WidgetManager) widgetManager: WidgetManager;

  @inject(ViewOptions) options: ViewOptions;

  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  @inject(LayoutRestorer) layoutRestorer: LayoutRestorer;

  @inject(OpenerService) openerService: OpenerService;

  @inject(DebugBarWidget) debugWidget: DebugBarWidget;

  async init(viewOptions: ViewPluginOptions) {
    this.mergeOptions(viewOptions);
    const { widgetFactories } = viewOptions;
    this.widgetManager.init(widgetFactories);
    this.layoutRestorer.init(viewOptions);
    await this.shell.init({
      createLayout: viewOptions.customLayout,
      splitScreenConfig: viewOptions.presetConfig?.splitScreenConfig,
      disableFullScreen: viewOptions.presetConfig?.disableFullScreen,
    });
    if (this.options?.defaultLayoutData?.debugBar) {
      this.debugWidget.initContent(viewOptions.defaultLayoutData?.debugBar);
    }
  }

  async attach(viewOptions: ViewPluginOptions) {
    await this.layoutRestorer.restoreLayout();

    viewOptions.defaultLayoutData?.defaultWidgets?.forEach(uri => {
      this.openerService.open(uri);
    });
    // activityBar is customized internally and is special.
    const activityBar = this.shell.activityBarWidget;
    this.viewRenderer.addReactPortal(activityBar);
    activityBar?.initView?.(
      viewOptions.defaultLayoutData?.activityBarItems || [],
    );

    this.shell.addWidget(activityBar, {
      area: LayoutPanelType.ACTIVITY_BAR,
    });

    const statusBar = this.shell.statusBarWidget;
    if (statusBar) {
      this.viewRenderer.addReactPortal(statusBar);
      statusBar.initView(viewOptions.defaultLayoutData?.statusBarItems || []);
      this.shell.addWidget(statusBar, {
        area: LayoutPanelType.STATUS_BAR,
      });
    }
  }

  private mergeOptions(viewOptions: ViewPluginOptions) {
    this.viewContributions.getContributions().forEach(contribution => {
      contribution.registerView({
        register: options => {
          mergeWith(viewOptions, options, (objValue, srcValue, key) => {
            if (
              [
                'widgetFactories',
                'activityBarItems',
                'statusBarItems',
                'defaultWidgets',
              ].includes(key)
            ) {
              return [...(objValue || []), ...srcValue];
            }
          });
        },
      });
    });
  }
}
