import React from 'react';

import {
  LayoutPanelType,
  withLazyLoad,
  type WidgetRegistry,
} from '@coze-project-ide/framework';
import { IconCozPlugin } from '@coze-arch/coze-design/icons';

export const PluginWidgetRegistry: WidgetRegistry = {
  match: /\/plugin\/.*/,
  area: LayoutPanelType.MAIN_PANEL,
  renderContent() {
    const Component = withLazyLoad(
      () => import('@coze-project-ide/biz-plugin/main'),
    );
    return <Component />;
  },
  renderIcon() {
    return <IconCozPlugin />;
  },
};
