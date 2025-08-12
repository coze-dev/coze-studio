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

import { type interfaces } from 'inversify';
import { type URI } from '@coze-project-ide/core';

import { WidgetFactory } from '../widget/widget-factory';
import { STATUS_BAR_CONTENT } from '../widget/react-widgets/status-bar-widget';
import { ACTIVITY_BAR_CONTENT } from '../widget/react-widgets/activity-bar-widget';
import { ActivityBarWidget, StatusBarWidget } from '../widget/react-widgets';
import { LayoutPanelType } from '../types';

export const bindActivityBarView = (bind: interfaces.Bind): void => {
  bind(WidgetFactory).toDynamicValue(({ container }) => ({
    area: LayoutPanelType.ACTIVITY_BAR,
    canHandle: (uri: URI) => uri.isEqualOrParent(ACTIVITY_BAR_CONTENT),
    createWidget: () => {
      const childContainer = container.createChild();
      childContainer.bind(ActivityBarWidget).toSelf().inSingletonScope();

      return childContainer.get(ActivityBarWidget);
    },
  }));
  bind(WidgetFactory).toDynamicValue(({ container }) => ({
    area: LayoutPanelType.STATUS_BAR,
    canHandle: (uri: URI) => uri.isEqualOrParent(STATUS_BAR_CONTENT),
    createWidget: () => {
      const childContainer = container.createChild();
      childContainer.bind(StatusBarWidget).toSelf().inSingletonScope();

      return childContainer.get(StatusBarWidget);
    },
  }));
};
