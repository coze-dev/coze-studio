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

import {
  WorkspaceSubMenu as BaseWorkspaceSubMenu,
  SpaceSelector,
} from '@coze-foundation/space-ui-base';
import { useSpaceStore } from '@coze-foundation/space-store';
import { I18n } from '@coze-arch/i18n';
// import {
//   IconCozBot,
//   IconCozBotFill,
//   IconCozKnowledge,
//   IconCozKnowledgeFill,
//   IconCozPeople,
//   IconCozPeopleFill,
//   IconCozSetting,
//   IconCozSettingFill,
// } from '@coze-arch/coze-design/icons';
import {
  IconBotDevelop,
  IconBotDevelopActive,
  IconBotPlugin,
  IconBotPluginActive,
  IconBotKnowledge,
  IconBotKnowledgeActive,
  IconBotPrompt,
  IconBotPromptActive,
  IconBotDatabaseDefault,
  IconBotDatabaseActive,
  IconBotModel,
  IconBotModelActive,
  IconBotWorkflow,
  IconBotWorkflowActive,
  IconBotMember,
  IconBotMemberActive,
} from '../../../../../components/bot-icons';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import { ResType } from '@coze-arch/idl/plugin_develop';

import { SpaceSubModuleEnum } from '@/const';

export const WorkspaceSubMenu = () => {
  const { subMenuKey } = useRouteConfig();
  const navigate = useNavigate();

  const {
    space: currentSpace,
    spaceList,
    recentlyUsedSpaceList,
    loading,
    createSpace,
    fetchSpaces,
  } = useSpaceStore(state => ({
    space: state.space,
    spaceList: state.spaceList,
    recentlyUsedSpaceList: state.recentlyUsedSpaceList,
    loading: !!state.loading || !state.inited,
    createSpace: state.createSpace,
    fetchSpaces: state.fetchSpaces,
  }));

  const subMenu = [
    {
      icon: <IconBotDevelop />,
      activeIcon: <IconBotDevelopActive />,
      title: () => I18n.t('navigation_workspace_develop', {}, 'Develop'),
      path: SpaceSubModuleEnum.DEVELOP,
      dataTestId: 'navigation_workspace_develop',
    },
    {
      type: 'title',
      title: () =>
        I18n.t('navigation_workspace_library_title', {}, 'Resource Library'),
    },
    // {
    //   icon: <IconCozKnowledge />,
    //   activeIcon: <IconCozKnowledgeFill />,
    //   title: () => I18n.t('navigation_workspace_library', {}, 'Library'),
    //   path: SpaceSubModuleEnum.LIBRARY,
    //   dataTestId: 'navigation_workspace_library',
    // },
    {
      icon: <IconBotWorkflow />,
      activeIcon: <IconBotWorkflowActive />,
      title: () =>
        I18n.t('navigation_workspace_library_workflow', {}, 'Workflow'),
      path: `${SpaceSubModuleEnum.LIBRARY}/${ResType.Workflow}`,
      dataTestId: 'navigation_workspace_library_workflow',
    },
    {
      icon: <IconBotPlugin />,
      activeIcon: <IconBotPluginActive />,
      title: () =>
        I18n.t('navigation_workspace_library_plugins', {}, 'Plugins'),
      path: `${SpaceSubModuleEnum.LIBRARY}/${ResType.Plugin}`,
      dataTestId: 'navigation_workspace_library_plugins',
    },
    {
      icon: <IconBotKnowledge />,
      activeIcon: <IconBotKnowledgeActive />,
      title: () =>
        I18n.t('navigation_workspace_library_knowledge', {}, 'Knowledge'),
      path: `${SpaceSubModuleEnum.LIBRARY}/${ResType.Knowledge}`,
      dataTestId: 'navigation_workspace_library_knowledge',
    },
    {
      icon: <IconBotPrompt />,
      activeIcon: <IconBotPromptActive />,
      title: () => I18n.t('navigation_workspace_library_prompt', {}, 'Prompt'),
      path: `${SpaceSubModuleEnum.LIBRARY}/${ResType.Prompt}`,
      dataTestId: 'navigation_workspace_library_prompt',
    },
    {
      icon: <IconBotDatabaseDefault />,
      activeIcon: <IconBotDatabaseActive />,
      title: () =>
        I18n.t('navigation_workspace_library_database', {}, 'Database'),
      path: `${SpaceSubModuleEnum.LIBRARY}/${ResType.Database}`,
      dataTestId: 'navigation_workspace_library_database',
    },
    {
      type: 'title',
      title: () => I18n.t('navigation_workspace_manage_title', {}, 'Manage'),
    },
    {
      icon: <IconBotModel />,
      activeIcon: <IconBotModelActive />,
      title: () => I18n.t('navigation_workspace_manage_models', {}, 'Models'),
      path: SpaceSubModuleEnum.MODELS,
      dataTestId: 'navigation_workspace_models',
    },
    {
      icon: <IconBotMember />,
      activeIcon: <IconBotMemberActive />,
      title: () => I18n.t('navigation_workspace_members', {}, 'Members'),
      path: SpaceSubModuleEnum.MEMBERS,
      dataTestId: 'navigation_workspace_members',
    },
  ];

  const handleSpaceChange = (spaceId: string) => {
    // 更新空间store中的当前空间
    useSpaceStore.getState().setSpace(spaceId);
    // 导航到新空间的develop页面
    navigate(`/space/${spaceId}/develop`);
  };

  const handleCreateSpace = async (data: {
    name: string;
    description: string;
  }) => {
    // 调用store的createSpace方法
    // 使用数字常量1表示Team空间类型 (SpaceType.Team = 1)
    const result = await createSpace({
      name: data.name,
      description: data.description,
      icon_uri: '',
      space_type: 1, // Team空间
    });

    if (result?.id) {
      // 刷新空间列表
      await fetchSpaces(true);
      // 切换到新创建的空间
      handleSpaceChange(result.id);
    }
  };

  const headerNode = (
    <SpaceSelector
      currentSpace={currentSpace}
      spaceList={spaceList}
      recentlyUsedSpaceList={recentlyUsedSpaceList}
      loading={loading}
      onSpaceChange={handleSpaceChange}
      onCreateSpace={handleCreateSpace}
    />
  );

  return (
    <BaseWorkspaceSubMenu
      header={headerNode}
      menus={subMenu}
      currentSubMenu={subMenuKey}
    />
  );
};
