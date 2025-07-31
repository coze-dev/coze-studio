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

import { DebugBarWidget } from '../widget/react-widgets/debug-bar-widget';
import { createPortal } from '../utils';
import { ApplicationShell } from '../shell/application-shell';
import { ViewOptions } from '../constants/view-options';

// Control debugging
@injectable()
export class DebugService {
  @inject(ViewOptions) viewOptions: ViewOptions;

  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(DebugBarWidget) debugBarWidget: DebugBarWidget;

  show() {
    this.debugBarWidget.show();
    this.debugBarWidget.update();
  }

  hide() {
    this.debugBarWidget.hide();
    this.debugBarWidget.update();
  }

  createPortal() {
    const originRenderer = this.debugBarWidget.render.bind(this.debugBarWidget);
    const portal = createPortal(
      this.debugBarWidget,
      originRenderer,
      this.viewOptions.widgetFallbackRender!,
    );
    this.shell.node.insertBefore(this.debugBarWidget.node, null);
    this.hide();
    return portal;
  }
}
