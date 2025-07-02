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
