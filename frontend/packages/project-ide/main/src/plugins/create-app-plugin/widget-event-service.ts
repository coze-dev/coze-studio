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

/**
 * Business logic that needs to be executed to listen for widget events
 */
import { inject, injectable } from 'inversify';
import {
  ProjectIDEServices,
  ViewService,
  WidgetManager,
  MAIN_PANEL_DEFAULT_URI,
  DisposableCollection,
  getPathnameByURI,
  type ReactWidget,
  OptionsService,
  compareURI,
  addPreservedSearchParams,
} from '@coze-project-ide/framework';

@injectable()
export class WidgetEventService {
  @inject(ViewService)
  private viewService: ViewService;

  @inject(WidgetManager)
  private widgetManager: WidgetManager;

  @inject(ProjectIDEServices)
  private projectIDEServices: ProjectIDEServices;

  @inject(OptionsService)
  private optionsService: OptionsService;

  private disposable = new DisposableCollection();

  listen() {
    // listen current widget change
    this.disposable.push(
      this.viewService.shell.onCurrentWidgetChange(widget => {
        this.toggleDefaultWidget(widget);
        this.syncURL(widget);
      }),
    );
  }

  /**
   * 1. You need to close the default page when a widget is opened
   * 2. When closing all widgets, you need to open the default page
   */
  toggleDefaultWidget(widget) {
    if ((widget as ReactWidget)?.uri) {
      const widgetUri = widget?.uri;
      if (widgetUri.displayName !== 'default') {
        // Close the default widget
        const defaultWidget = this.widgetManager.getWidgetFromURI(
          MAIN_PANEL_DEFAULT_URI,
        );
        defaultWidget?.dispose?.();
      }
    } else {
      this.viewService.disableFullScreenMode();
      this.projectIDEServices.view.openDefault();
    }
  }

  /**
   * Synchronize url changes when switching resource tabs
   */
  syncURL(widget) {
    if (widget) {
      const widgetUri = widget?.uri;
      // Default page does not need to synchronize URLs
      if (compareURI(widgetUri, MAIN_PANEL_DEFAULT_URI)) {
        return;
      }
      if (widgetUri) {
        const path = getPathnameByURI(widgetUri);
        if (path) {
          let url = `/space/${this.optionsService.spaceId}/project-ide/${this.optionsService.projectId}${path}`;
          if (widgetUri.query) {
            url += `?${widgetUri.query}`;
          }
          this.navigate(url);
        }
      }
    } else {
      this.navigate(
        `/space/${this.optionsService.spaceId}/project-ide/${this.optionsService.projectId}`,
      );
    }
  }

  diffPath(next: string) {
    const { pathname, search } = window.location;
    return pathname + search !== next;
  }

  navigate(url: string) {
    if (!this.diffPath(url)) {
      return;
    }
    this.optionsService.navigate(addPreservedSearchParams(url));
  }

  dispose() {
    this.disposable.dispose();
  }
}
