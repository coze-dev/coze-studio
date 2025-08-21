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

import { useParams } from 'react-router-dom';
import { type FC, type PropsWithChildren } from 'react';

import { GlobalLayout } from '@coze-foundation/layout';
import { useCreateBotAction } from '@coze-foundation/global';
import { RequireAuthContainer } from '@coze-foundation/account-ui-adapter';
import { I18n } from '@coze-arch/i18n';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import {
  IconCozPlusCircle,
  // IconCozWorkspace,
  // IconCozWorkspaceFill,
  // IconCozCompass,
  // IconCozCompassFill,
  // IconCozDocument,
} from '@coze-arch/coze-design/icons';
import {
  IconBotDoc,
  IconBotWorkspace,
  IconBotShop,
  IconBotTemplate,
  IconBotWorkspaceFill,
  IconBotShopFill,
  IconBotTemplateFill,
} from '../../../../../components/bot-icons';

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
            icon: <IconBotWorkspace />,
            activeIcon: <IconBotWorkspaceFill />,
            path: '/space',
            dataTestId: 'layout_workspace-button',
          },
          {
            title: I18n.t('menu_title_store'),
            icon: <IconBotShop />,
            activeIcon: <IconBotShopFill />,
            path: '/explore',
            dataTestId: 'layout_explore-button',
          },
          {
            title: I18n.t('menu_title_template'),
            icon: <IconBotTemplate />,
            activeIcon: <IconBotTemplateFill />,
            path: '/template/list',
            dataTestId: 'layout_explore-template-button',
          },
        ]}
        extras={[
          {
            icon: <IconBotDoc />,
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
