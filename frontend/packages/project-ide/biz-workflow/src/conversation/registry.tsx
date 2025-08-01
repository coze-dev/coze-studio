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

import { I18n } from '@coze-arch/i18n';
import { IconCozChatSetting } from '@coze-arch/coze-design/icons';
import {
  LayoutPanelType,
  withLazyLoad,
  type WidgetRegistry,
  type WidgetContext,
} from '@coze-project-ide/framework';

export const ConversationRegistry: WidgetRegistry = {
  match: /(\/session.*|\/conversation.*)/,
  area: LayoutPanelType.MAIN_PANEL,
  load: (ctx: WidgetContext) =>
    Promise.resolve().then(() => {
      ctx.widget.setTitle(I18n.t('wf_chatflow_101'));
      ctx.widget.setUIState('normal');
    }),
  renderContent() {
    const Component = withLazyLoad(() => import('./main'));
    return <Component />;
  },
  renderIcon() {
    return <IconCozChatSetting />;
  },
};
