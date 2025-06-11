import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozChatSetting } from '@coze/coze-design/icons';
import {
  LayoutPanelType,
  withLazyLoad,
  type WidgetRegistry,
  type WidgetContext,
} from '@coze-project-ide/framework';

export const ConversationRegistry: WidgetRegistry = {
  // TODO: 持久化兼容，一段时间后下掉对 session 的兼容 @jiangxujin
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
