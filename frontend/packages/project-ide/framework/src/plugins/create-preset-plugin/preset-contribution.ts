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
import { I18n } from '@coze-arch/i18n';
import {
  type ViewContribution,
  type ViewOptionRegisterService,
  type URI,
  LayoutPanelType,
  type WidgetFactory,
  type LifecycleContribution,
  BoxPanel,
  ApplicationShell,
  WidgetManager,
  CommandRegistry,
  ShortcutsService,
  ContextKeyService,
  ToolbarAlign,
  Command,
  ViewRenderer,
  type ReactWidget,
} from '@coze-project-ide/client';

import { ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { PrimarySidebarWidget } from '@/widgets/primary-sidebar-widget';
import { ProjectIDEClientProps, type WidgetRegistry } from '@/types';
import { WsService } from '@/services';
import { WidgetContext } from '@/context/widget-context';
import { CustomCommand } from '@/constants';

import { customLayout } from '../../utils';
import {
  SIDEBAR_URI,
  UI_BUILDER_URI,
  UI_BUILDER_CONTENT,
  TOP_BAR_URI,
  MAIN_PANEL_DEFAULT_URI,
  SECONDARY_SIDEBAR_URI,
} from '../../constants';
import { withRegistryContent } from './with-registry-content';
import { WidgetService } from './widget-service';
import { ViewService } from './view-service';
import { ProjectIDEServices } from './project-ide-services';

@injectable()
export class PresetContribution
  implements ViewContribution, LifecycleContribution
{
  @inject(ProjectIDEClientProps) props: ProjectIDEClientProps;

  @inject(WidgetManager) widgetManager: WidgetManager;

  @inject(ContextKeyService) contextKeyService: ContextKeyService;

  @inject(ProjectIDEServices) services: ProjectIDEServices;

  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  @inject(ShortcutsService) shortcutsService: ShortcutsService;

  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(ViewService) viewService: ViewService;

  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  @inject(WsService) wsService: WsService;

  onInit() {
    this.wsService.init();
    // register command
    this.props.view.widgetRegistries.forEach(registry => {
      if (registry.registerCommands) {
        const commands = registry.registerCommands();
        commands.forEach(cmd => {
          const existCmd = this.commandRegistry.getCommand(cmd.id);

          if (!existCmd) {
            this.commandRegistry.registerCommand(
              {
                id: cmd.id,
                label: cmd.label,
              },
              {
                execute: props => {
                  const currentContext = this.contextKeyService.getContext(
                    'widgetContext',
                  ) as WidgetContext;
                  cmd.execute(currentContext, props);
                },
                isEnabled: props => {
                  const currentUri = this.contextKeyService.getContext(
                    'widgetFocus',
                  ) as URI;
                  const currentContext = this.contextKeyService.getContext(
                    'widgetContext',
                  ) as WidgetContext;
                  if (
                    currentUri?.toString?.() &&
                    !registry.match.test(currentUri.toString()) &&
                    cmd.when === 'widgetFocus'
                  ) {
                    return false;
                  }
                  return cmd.isEnable(currentContext, props);
                },
              },
            );
          }
        });
      }
      if (registry.registerShortcuts) {
        const shortcuts = registry.registerShortcuts();

        shortcuts.forEach(shortcut => {
          this.shortcutsService.registerHandlers({
            commandId: shortcut.commandId,
            keybinding: shortcut.keybinding,
            preventDefault: shortcut.preventDefault,
          });
        });
      }
      if (registry.registerContextMenu) {
        const menus = registry.registerContextMenu();
        this.services.contextmenu.registerContextMenu(menus, registry.match);
      }
    });
    // Override full screen logic
    this.commandRegistry.unregisterCommand(Command.Default.VIEW_FULL_SCREEN);
    this.commandRegistry.registerCommand(
      {
        id: Command.Default.VIEW_FULL_SCREEN,
        label: I18n.t('project_ide_maximize'),
      },
      {
        execute: () => {
          this.viewService.switchFullScreenMode();
        },
      },
    );
    this.commandRegistry.registerCommand(
      {
        id: CustomCommand.RELOAD,
        label: I18n.t('refresh_project_tags'),
      },
      {
        execute: (widget?: ProjectIDEWidget) => {
          if (!widget) {
            const { currentWidget } = this.shell;
            (currentWidget as ProjectIDEWidget)?.refresh?.();
          } else {
            widget.refresh();
          }
        },
      },
    );
    this.shortcutsService.registerHandlers({
      commandId: CustomCommand.RELOAD,
      keybinding: 'alt r',
      preventDefault: false,
    });
  }

  private createLayout(shell: ApplicationShell) {
    // Set up panel storage to widgetManager
    const uiBuilderPanel = new BoxPanel();
    uiBuilderPanel.id = UI_BUILDER_URI.displayName;
    this.widgetManager.setWidget(UI_BUILDER_URI.toString(), uiBuilderPanel);
    return customLayout(shell, uiBuilderPanel);
  }

  private createWidget(factory: WidgetRegistry<any>, uri: URI) {
    const childContainer = this.widgetManager.containerFactory.createChild();
    childContainer.bind(ProjectIDEWidget).toSelf().inSingletonScope();
    const widget = childContainer.get<ProjectIDEWidget>(ProjectIDEWidget);

    const store = factory.createStore?.(uri);

    childContainer.bind(WidgetService).toSelf().inSingletonScope();
    const widgetService = childContainer.get(WidgetService);
    widgetService.init(factory, this.props.view.widgetTitleRender);

    const widgetContext: WidgetContext = {
      uri,
      store,
      widget: widgetService,
      services: this.services,
    };
    widget.context = widgetContext;
    widget.container = childContainer;
    childContainer.bind(WidgetContext).toConstantValue(widgetContext);
    widget.render = withRegistryContent(factory);

    return widget;
  }

  registerView(service: ViewOptionRegisterService): void {
    const widgetFactories: WidgetFactory[] =
      this.props.view.widgetRegistries.map(factory => ({
        area: factory.area || LayoutPanelType.MAIN_PANEL,
        match: factory.match,
        createWidget: this.createWidget.bind(this, factory),
        toolbarItems: this.props.view.preToolbar
          ? [
              {
                render: this.props.view.preToolbar as (
                  widget: ReactWidget,
                ) => React.ReactElement<any, any> | null,
                align: ToolbarAlign.LEADING,
              },
              {
                render: this.props.view.toolbar as (
                  widget: ReactWidget,
                ) => React.ReactElement<any, any> | null,
                align: ToolbarAlign.TRAILING,
              },
            ]
          : [],
      }));
    service.register({
      presetConfig: {
        disableContextMenu: true,
        splitScreenConfig: {
          main: {
            splitOptions: {
              maxSplitCount: 2,
              splitOrientation: 'horizontal', // Only horizontal split screen is supported.
            },
            dockPanelOptions: {
              spacing: 6,
            },
          },
        },
        disableFullScreen: true,
      },
      widgetFactories: [
        {
          area: LayoutPanelType.MAIN_PANEL,
          canHandle: UI_BUILDER_CONTENT.match.bind(UI_BUILDER_CONTENT),
          render: this.props.view.uiBuilder,
        },
        {
          area: LayoutPanelType.TOP_BAR,
          canHandle: TOP_BAR_URI.match.bind(TOP_BAR_URI),
          render: this.props.view.topBar,
        },
        {
          area: LayoutPanelType.MAIN_PANEL,
          canHandle: MAIN_PANEL_DEFAULT_URI.match.bind(MAIN_PANEL_DEFAULT_URI),
          render: this.props.view.widgetDefaultRender,
        },
        {
          area: LayoutPanelType.PRIMARY_SIDEBAR,
          canHandle: SIDEBAR_URI.match.bind(SIDEBAR_URI),
          widget: PrimarySidebarWidget,
        },
        {
          area: LayoutPanelType.SECONDARY_SIDEBAR,
          canHandle: SECONDARY_SIDEBAR_URI.match.bind(SECONDARY_SIDEBAR_URI),
          render: this.props.view.secondarySidebar,
        },
        ...widgetFactories,
      ],
      defaultLayoutData: {
        defaultWidgets: [TOP_BAR_URI],
      },
      customLayout: this.createLayout.bind(this),
    });
  }

  onDispose() {
    this.wsService.onDispose();
  }
}
