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

import { WorkspaceSubMenu as BaseWorkspaceSubMenu } from '@coze-foundation/space-ui-base';
import { useSpaceStore } from '@coze-foundation/space-store';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozBot,
  IconCozBotFill,
  IconCozKnowledge,
  IconCozKnowledgeFill,
  IconCozSetting,
  IconCozSettingFill,
} from '@coze-arch/coze-design/icons';
import { Space, Avatar, Typography } from '@coze-arch/coze-design';
import { useRouteConfig } from '@coze-arch/bot-hooks';

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
    {
      icon: <IconCozSetting />,
      activeIcon: <IconCozSettingFill />,
      title: () => '模型配置',
      path: SpaceSubModuleEnum.MODELS,
      dataTestId: 'navigation_workspace_models',
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
