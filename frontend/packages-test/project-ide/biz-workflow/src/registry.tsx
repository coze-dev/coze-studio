import React from 'react';

import {
  LayoutPanelType,
  withLazyLoad,
  type WidgetRegistry,
} from '@coze-project-ide/framework';

import { WorkflowWidgetIcon } from './components';

export const WorkflowWidgetRegistry: WidgetRegistry = {
  match: /\/workflow\/.*/,
  area: LayoutPanelType.MAIN_PANEL,
  renderContent() {
    const Component = withLazyLoad(() => import('./main'));
    return <Component />;
  },
  renderIcon(ctx) {
    return <WorkflowWidgetIcon context={ctx} />;
  },
  onFocus(ctx) {
    ctx.widget.onFocusEmitter.fire();
  },
};
