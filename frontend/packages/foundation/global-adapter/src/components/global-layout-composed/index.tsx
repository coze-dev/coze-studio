import { useParams } from 'react-router-dom';
import { type FC, type PropsWithChildren } from 'react';

import { GlobalLayout } from '@coze-foundation/layout';
import { useCreateBotAction } from '@coze-foundation/global';
import { RequireAuthContainer } from '@coze-foundation/account-ui-adapter';
import { I18n } from '@coze-arch/i18n';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import {
  IconCozPlusCircle,
  IconCozWorkspace,
  IconCozWorkspaceFill,
  IconCozCompass,
  IconCozCompassFill,
  IconCozDocument,
} from '@coze/coze-design/icons';

import { AccountDropdown } from '../account-dropdown';
import { useHasSider } from './hooks/use-has-sider';

export const GlobalLayoutComposed: FC<PropsWithChildren> = ({ children }) => {
  const config = useRouteConfig();
  const hasSider = useHasSider();
  const { space_id } = useParams();

  const { createBot, createBotModal } = useCreateBotAction({
    currentSpaceId: space_id,
  });

  return (
    <RequireAuthContainer
      needLogin={!!config.requireAuth}
      loginOptional={!!config.requireAuthOptional}
    >
      <GlobalLayout
        hasSider={hasSider}
        banner={null}
        actions={[
          {
            tooltip: I18n.t('creat_tooltip_create'),
            icon: <IconCozPlusCircle />,
            onClick: createBot,
            dataTestId: 'layout_create-agent-button',
          },
        ]}
        menus={[
          {
            title: I18n.t('navigation_workspace'),
            icon: <IconCozWorkspace />,
            activeIcon: <IconCozWorkspaceFill />,
            path: '/space',
          },
          {
            title: I18n.t('menu_title_store'),
            icon: <IconCozCompass />,
            activeIcon: <IconCozCompassFill />,
            path: '/explore',
          },
        ]}
        extras={[
          {
            icon: <IconCozDocument />,
            tooltip: I18n.t('menu_documents'),
            onClick: () => {
              // cp-disable-next-line
              window.open('https://www.coze.cn/open/docs/guides');
            },
            dataTestId: 'layout_document-button',
          },
        ]}
        footer={<AccountDropdown />}
      >
        {children}
        {createBotModal}
      </GlobalLayout>
    </RequireAuthContainer>
  );
};
