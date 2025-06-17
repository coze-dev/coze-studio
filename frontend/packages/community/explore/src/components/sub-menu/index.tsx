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
