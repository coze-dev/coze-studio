import { WorkspaceSubMenu as BaseWorkspaceSubMenu } from '@coze-foundation/space-ui-base';
import { useSpaceStore } from '@coze-foundation/space-store';
import { I18n } from '@coze-arch/i18n';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import {
  IconCozBot,
  IconCozBotFill,
  IconCozKnowledge,
  IconCozKnowledgeFill,
} from '@coze-arch/coze-design/icons';
import { Space, Avatar, Typography } from '@coze-arch/coze-design';

import { SpaceSubModuleEnum } from '@/const';

export const WorkspaceSubMenu = () => {
  const { subMenuKey } = useRouteConfig();

  const currentSpace = useSpaceStore(state => state.space);

  const subMenu = [
    {
      icon: <IconCozBot />,
      activeIcon: <IconCozBotFill />,
      title: () => I18n.t('navigation_workspace_develop', {}, 'Develop'),
      path: SpaceSubModuleEnum.DEVELOP,
      dataTestId: 'navigation_workspace_develop',
    },
    {
      icon: <IconCozKnowledge />,
      activeIcon: <IconCozKnowledgeFill />,
      title: () => I18n.t('navigation_workspace_library', {}, 'Library'),
      path: SpaceSubModuleEnum.LIBRARY,
      dataTestId: 'navigation_workspace_library',
    },
  ];

  const headerNode = (
    <div className="cursor-pointer w-full">
      <Space
        className="h-[48px] px-[8px] w-full hover:coz-mg-secondary-hovered rounded-[8px]"
        spacing={8}
      >
        <Avatar
          className="w-[24px] h-[24px] rounded-[6px] shrink-0"
          src={currentSpace?.icon_url}
        />
        <Typography.Text
          ellipsis={{ showTooltip: true, rows: 1 }}
          className="flex-1 coz-fg-primary text-[14px] font-[500]"
        >
          {currentSpace?.name || ''}
        </Typography.Text>
      </Space>
    </div>
  );

  return (
    <BaseWorkspaceSubMenu
      header={headerNode}
      menus={subMenu}
      currentSubMenu={subMenuKey}
    />
  );
};
