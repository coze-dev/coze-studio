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
