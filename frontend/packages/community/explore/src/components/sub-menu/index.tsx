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
 
import { useNavigate } from 'react-router-dom';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozTemplate,
  IconCozTemplateFill,
  IconCozPlugin,
  IconCozPluginFill,
} from '@coze-arch/coze-design/icons';
import { Space } from '@coze-arch/coze-design';
import { SubMenuItem } from '@coze-community/components';

import { useExploreRoute } from '../../hooks/use-explore-route';

const getMenuConfig = () => [
  {
    type: 'plugin',
    icon: <IconCozPlugin />,
    activeIcon: <IconCozPluginFill />,
    title: I18n.t('Plugins'),
    isActive: true,
    path: '/explore/plugin',
  },
  {
    icon: <IconCozTemplate />,
    activeIcon: <IconCozTemplateFill />,
    title: I18n.t('template_name'),
    isActive: true,
    type: 'template',
    path: '/explore/template',
  },
];

export const ExploreSubMenu = () => {
  const navigate = useNavigate();
  const { type } = useExploreRoute();
  const menuConfig = getMenuConfig();
  return (
    <Space spacing={4} vertical>
      <p className="text-[14px] w-full text-left font-medium coz-fg-secondary ">
        {I18n.t('menu_title_personal_space')}
      </p>
      {menuConfig.map(item => (
        <SubMenuItem
          {...item}
          isActive={item.type === type}
          onClick={() => {
            navigate(item.path);
          }}
        />
      ))}
    </Space>
  );
};
