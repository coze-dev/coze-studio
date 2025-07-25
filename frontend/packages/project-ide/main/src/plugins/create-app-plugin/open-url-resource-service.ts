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
 * project ide app 初始化时打开 url 上携带的资源
 */
import { inject, injectable } from 'inversify';
import {
  getURIByPath,
  getResourceByPathname,
  getURIPathByPathname,
  getURIByResource,
  ProjectIDEServices,
  ViewService,
  Disposable,
  UI_BUILDER_URI,
  MAIN_PANEL_DEFAULT_URI,
  DisposableCollection,
  ApplicationShell,
  type ReactWidget,
} from '@coze-project-ide/framework';

@injectable()
export class OpenURIResourceService {
  @inject(ProjectIDEServices)
  private projectIDEServices: ProjectIDEServices;

  @inject(ViewService)
  private viewService: ViewService;

  @inject(ApplicationShell)
  private applicationShell: ApplicationShell;

  private disposable = new DisposableCollection();

  /**
   * 针对 1.直接打开；2.外部系统跳转的场景，请勿在此添加其他副作用逻辑
   */
  open() {
    const { resourceType } = getResourceByPathname(window.location.pathname);
    // ui-builder
    if (resourceType === UI_BUILDER_URI.displayName) {
      this.openDesign();
      // 展示默认页
      this.tryOpenDefault();
    } else {
      const path = getURIPathByPathname(window.location.pathname);
      if (!path || path.startsWith(MAIN_PANEL_DEFAULT_URI.displayName)) {
        this.tryOpenDefault();
        // 路由不匹配时需要手动激活 currentWidget
        if (this.applicationShell.mainPanel.currentTitle?.owner) {
          this.applicationShell.setCurrentWidget(
            this.applicationShell.mainPanel?.currentTitle?.owner as ReactWidget,
          );
        }
      } else {
        this.projectIDEServices.view.open(getURIByPath(path));
      }
    }
  }

  listen() {
    const POP_STATE_EVENT_TYPE = 'popstate';
    window.addEventListener(POP_STATE_EVENT_TYPE, this.syncPopstate);
    this.disposable.push(
      Disposable.create(() =>
        window.removeEventListener(POP_STATE_EVENT_TYPE, this.syncPopstate),
      ),
    );
  }

  openDevelop(resourceType: string, resourceId: string, query?: string) {
    this.projectIDEServices.view.open(
      getURIByResource(resourceType, resourceId, query),
    );
  }

  openDesign() {
    this.projectIDEServices.view.openPanel('ui-builder');
  }
  tryOpenDefault() {
    if (this.viewService.shell.mainPanel?.tabBars?.()?.next?.()?.done) {
      this.projectIDEServices.view.openDefault();
    }
  }

  syncPopstate = () => {
    this.open();
  };
  dispose() {
    this.disposable.dispose();
  }
}
