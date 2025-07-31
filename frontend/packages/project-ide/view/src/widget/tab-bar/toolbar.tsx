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

import React, { useMemo } from 'react';

import { inject, injectable } from 'inversify';
import { isFunction } from '@flowgram-adapter/common';
import {
  CommandRegistry,
  ShortcutsService,
  type URI,
} from '@coze-project-ide/core';

import { ReactWidget } from '../react-widget';
import { WidgetManager } from '../../widget-manager';
import { ToolbarAlign } from '../../types';
import { ApplicationShell } from '../../shell';
import { HoverService } from '../../services/hover-service';
import { type TabBar, type Widget } from '../../lumino/widgets';
import {
  DISABLE_HANDLE_EVENT,
  TAB_BAR_TOOLBAR,
  TAB_BAR_TOOLBAR_ITEM,
} from '../../constants';

export const TabBarToolbarFactory = Symbol('TabBarToolbarFactory');

export interface TabBarToolbarFactory {
  (align?: ToolbarAlign): TabBarToolbar;
}

@injectable()
export class TabBarToolbar extends ReactWidget {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(ShortcutsService) shortcutsService: ShortcutsService;

  @inject(HoverService) hoverService: HoverService;

  @inject(CommandRegistry) commandRegistry: CommandRegistry;

  @inject(WidgetManager) widgetManager: WidgetManager;

  public currentURI?: URI;

  protected align?: ToolbarAlign;

  public tabBar: TabBar<Widget>;

  initAlign(align?: ToolbarAlign) {
    if (align) {
      this.align = align;
    }
  }

  updateURI(uri: URI) {
    this.currentURI = uri;
    this.update();
  }

  render() {
    const uri = this.currentURI;
    const content = useMemo(() => {
      if (!uri) {
        return undefined;
      }
      const factory = this.widgetManager.getFactoryFromURI(uri);
      const currentWidget = this.widgetManager.getWidgetFromURI(
        uri,
        factory,
      ) as ReactWidget;
      return (factory?.toolbarItems || [])
        .filter(item => {
          // Default is ToolbarAlign. TRAILING
          if (!this.align) {
            return !item.align || item.align === ToolbarAlign.TRAILING;
          }
          return item.align === this.align;
        })
        .map((item, idx) => {
          let itemContent: React.ReactNode;
          let tooltipContent: React.ReactNode;
          let onClick: undefined | (() => void);
          if (item.render) {
            itemContent = item.render(currentWidget);
          } else if (item.commandId) {
            const commandInfo = this.commandRegistry.getCommand(item.commandId);
            tooltipContent = this.shortcutsService.getLabelWithShortcutUI(
              item.commandId,
            );
            if (commandInfo?.icon) {
              itemContent = (
                <div className={DISABLE_HANDLE_EVENT}>
                  {isFunction(commandInfo.icon)
                    ? commandInfo.icon(currentWidget)
                    : commandInfo?.icon}
                </div>
              );
              onClick = () =>
                this.commandRegistry.executeCommand(
                  item.commandId!,
                  currentWidget,
                );
            }
          }
          if (itemContent) {
            return (
              <div
                key={item.commandId || idx}
                className={TAB_BAR_TOOLBAR_ITEM}
                onMouseEnter={e => {
                  if (tooltipContent) {
                    this.hoverService.requestHover({
                      content: tooltipContent,
                      target: e.currentTarget as HTMLElement,
                      position: 'bottom',
                    });
                  }
                }}
                onClick={onClick}
              >
                {itemContent}
              </div>
            );
          }
          return null;
        });
    }, [uri]);

    return <div className={TAB_BAR_TOOLBAR}>{content}</div>;
  }
}
