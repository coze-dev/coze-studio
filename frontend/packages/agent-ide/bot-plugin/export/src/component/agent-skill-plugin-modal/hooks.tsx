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
 
import { useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { userStoreService } from '@coze-studio/user-store';
import { useCollaborationStore } from '@coze-studio/bot-detail-store/collaboration';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  PluginType,
  ProductEntityType,
  SortType,
} from '@coze-arch/bot-api/product_api';
import {
  OrderBy,
  SpaceType,
  type PluginApi,
} from '@coze-arch/bot-api/developer_api';
import {
  DEFAULT_PAGE,
  MineActiveEnum,
  PluginFilterType,
  type PluginQuery,
  type PluginModalModeProps,
  From,
} from '@coze-agent-ide/plugin-shared';
import { PluginModalFilter } from '@coze-agent-ide/plugin-modal-adapter';

import { PluginModalSider } from './sider';
import { PluginModalContent } from './content';

export interface UsePluginModalPartsProp extends PluginModalModeProps {
  pluginApiList: PluginApi[];
  onPluginApiListChange: (list: PluginApi[]) => void;
  agentId?: string;
  projectId?: string;
  isShowStorePlugin?: boolean;
}

/**
 * 获取初始化类型
 * @param from 来源
 * @param spaceType 空间类型
 * @returns 初始化类型
 */
const getInitType = (from?: From, spaceType?: SpaceType) => {
  // 项目workflow引用插件，默认选中项目插件
  if (from === From.ProjectWorkflow) {
    return '';
  }
  if (from !== From.ProjectIde || !spaceType || !from) {
    return '';
  }
  // projectIDE下，并且是个人空间，选中Mine
  if (spaceType === SpaceType.Personal) {
    return PluginFilterType.Mine;
  }
  // projectIDE下，并且是团队空间，选中Team
  if (spaceType === SpaceType.Team && from === From.ProjectIde) {
    return PluginFilterType.Team;
  }
  return '';
};

export const usePluginModalParts = ({
  pluginApiList,
  onPluginApiListChange,
  agentId,
  openMode,
  from,
  openModeCallback,
  showButton,
  showCopyPlugin,
  onCopyPluginCallback,
  projectId,
  clickProjectPluginCallback,
  onCreateSuccess,
  isShowStorePlugin,
  hideCreateBtn,
  initQuery,
}: UsePluginModalPartsProp) => {
  // 获取devId
  const userInfo = userStoreService.useUserInfo();
  const spaceType = useSpaceStore(store => store.space.space_type);
  const [query, setQuery] = useState<PluginQuery>({
    agentId,
    projectId,
    devId: userInfo?.user_id_str || '',
    search: '',
    page: DEFAULT_PAGE,
    // 项目IDE插件仅展示我的插件
    type: initQuery?.type ?? getInitType(from, spaceType),
    orderBy: OrderBy.CreateTime,
    orderByPublic: SortType.Heat,
    orderByFavorite: SortType.Newest,
    mineActive: MineActiveEnum.All,
    isOfficial: initQuery?.isOfficial ?? undefined,
    // project workflow添加插件，只展示云插件
    pluginType:
      from === From.ProjectWorkflow ? PluginType.CLoudPlugin : undefined,
  });
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );
  const { version } = useCollaborationStore(
    useShallow(state => ({
      version: state.baseVersion,
    })),
  );
  const updateQuery = (value: Partial<PluginQuery>, refreshPage = true) => {
    const botInfo = {
      current_entity_type: ProductEntityType.Bot,
      current_entity_id: botId,
      current_entity_version: version,
    };
    setQuery(prev => {
      if (refreshPage) {
        return {
          ...prev,
          ...value,
          page: DEFAULT_PAGE,
          botInfo,
        };
      }
      return {
        ...prev,
        ...value,
        botInfo,
      };
    });
  };

  const sider = (
    <PluginModalSider
      hideCreateBtn={hideCreateBtn}
      query={query}
      setQuery={updateQuery}
      from={from}
      onCreateSuccess={onCreateSuccess}
      isShowStorePlugin={isShowStorePlugin}
    />
  );
  const filter = (
    <PluginModalFilter from={from} query={query} setQuery={updateQuery} />
  );
  const content = (
    <PluginModalContent
      query={query}
      setQuery={updateQuery}
      pluginApiList={pluginApiList}
      onPluginApiListChange={onPluginApiListChange}
      openMode={openMode}
      from={from}
      openModeCallback={openModeCallback}
      showButton={showButton}
      showCopyPlugin={showCopyPlugin}
      onCopyPluginCallback={onCopyPluginCallback}
      clickProjectPluginCallback={clickProjectPluginCallback}
    />
  );

  return {
    sider,
    content,
    filter,
  } as const;
};
