import React from 'react';

import {
  IconCozDatabase,
  IconCozKnowledge,
  IconCozVariables,
} from '@coze-arch/coze-design/icons';
import {
  LayoutPanelType,
  withLazyLoad,
  type WidgetRegistry,
} from '@coze-project-ide/framework';

export const KnowledgeWidgetRegistry: WidgetRegistry = {
  match: /\/knowledge\/.*/,
  area: LayoutPanelType.MAIN_PANEL,
  renderContent() {
    const Component = withLazyLoad(() => import('./main'));
    // return <div>this is knowledge</div>;
    return <Component />;
  },
  renderIcon() {
    return <IconCozKnowledge />;
  },
};

export const VariablesWidgetRegistry: WidgetRegistry = {
  match: /\/variables\/?$/,
  area: LayoutPanelType.MAIN_PANEL,
  renderContent() {
    const Component = withLazyLoad(() => import('./variables-main'));
    return <Component />;
  },
  renderIcon() {
    return <IconCozVariables />;
  },
};

export const DatabaseWidgetRegistry: WidgetRegistry = {
  match: /\/database\/.*/,
  area: LayoutPanelType.MAIN_PANEL,
  renderContent() {
    const Component = withLazyLoad(() => import('./database-main'));
    return <Component />;
  },
  renderIcon() {
    return <IconCozDatabase />;
  },
};
