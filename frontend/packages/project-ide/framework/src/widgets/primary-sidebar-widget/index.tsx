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

import { injectable, type interfaces } from 'inversify';
import { SplitWidget, type URI } from '@coze-project-ide/client';

import { type WidgetContext } from '@/context';

import { SIDEBAR_RESOURCE_URI, SIDEBAR_CONFIG_URI } from '../../constants/uri';
import { ResourceWidget } from './resource-widget';
import { ConfigWidget } from './config-widget';

@injectable()
export class PrimarySidebarWidget extends SplitWidget {
  context: WidgetContext;

  container: interfaces.Container;

  render(): any {
    return null;
  }

  init(uri: URI) {
    this.orientation = 'vertical';
    this.defaultStretch = [0.7, 0.3];
    this.splitPanels = [
      {
        widgetUri: SIDEBAR_RESOURCE_URI,
        widget: ResourceWidget,
        order: 1,
      },
      {
        widgetUri: SIDEBAR_CONFIG_URI,
        widget: ConfigWidget,
        order: 2,
      },
    ];
    super.init(uri);
  }
}
