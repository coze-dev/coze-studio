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
 
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { ProjectResourceGroupType } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { resTypeDTOToVO } from '@/utils';
import { type BizResourceTree } from '@/resource-folder-coze/type';

export interface PrimarySidebarActions {
  updateGroupExpand: (
    groupType: ProjectResourceGroupType,
    expand: boolean,
  ) => void;
  isFetching?: boolean;
  initLoaded?: boolean;
  setSelectedResource: (resourceId?: string) => void;
  /**
   * 调用 store 里的 refetch 方法通知资源列表刷新
   * @param resourceType 刷新的资源类型，可选，不传时刷新所有类型的资源
   */
  refetch: (callback?: (tree?: BizResourceTree[]) => void) => Promise<void>;
  /**
   * 设置资源列表的刷新方法到 store 里，供其他 widget 里调用 store.refetch(xxx) 刷新资源列表
   * @param refetchFunc 刷新方法，刷新方法里内部需要处理资源列表的 setResource
   */
  fetchResource: (
    spaceId: string,
    projectId: string,
    version?: string,
    callback?: (tree?: BizResourceTree[]) => void,
  ) => Promise<void>;
  setCanClosePopover: (canClose: boolean) => void;
}

export interface PrimarySidebarState {
  projectId?: string;
  spaceId?: string;
  version?: string;
  resourceTree: BizResourceTree[];
  /**
   * 资源分组展开状态，按资源分组类型分开记录
   */
  groupExpandMap: Record<ProjectResourceGroupType, boolean>;
  /**
   * 当前选中的资源
   */
  selectedResource?: string;
  /**
   * 是否可以关闭 popover sidebar，右键菜单打开时不允许关闭，供 ResourceFolderCoze 组件消费
   */
  canClosePopover?: boolean;
}

const defaultState: PrimarySidebarState = {
  resourceTree: [],
  canClosePopover: true,
  groupExpandMap: {
    [ProjectResourceGroupType.Workflow]: true,
    [ProjectResourceGroupType.Plugin]: true,
    [ProjectResourceGroupType.Data]: true,
  },
};
export const usePrimarySidebarStore = create<
  PrimarySidebarState & PrimarySidebarActions
>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      updateGroupExpand: (
        groupType: ProjectResourceGroupType,
        expand: boolean,
      ) => {
        set({
          groupExpandMap: {
            ...get().groupExpandMap,
            [groupType]: expand,
          },
        });
      },
      setSelectedResource: (resourceId?: string) => {
        set({
          selectedResource: resourceId,
        });
      },
      // eslint-disable-next-line max-params
      fetchResource: async (spaceId, projectId, version, callback) => {
        set({
          isFetching: true,
          spaceId,
          projectId,
          version,
        });
        const res = await PluginDevelopApi.ProjectResourceList({
          project_id: projectId ?? '',
          space_id: spaceId,
          project_version: version,
        });
        const resourceTree = res.resource_groups?.map<BizResourceTree>(
          group => ({
            groupType: group.group_type,
            resourceList:
              group.resource_list?.map(resourceInfo => ({
                id: String(resourceInfo.res_id ?? ''),
                type: resTypeDTOToVO(resourceInfo.res_type),
                name: resourceInfo.name ?? '',
                ...resourceInfo,
              })) || [],
          }),
        );
        callback?.(resourceTree);
        set({
          resourceTree,
          isFetching: false,
          initLoaded: true,
        });
      },
      refetch: async callback => {
        const { spaceId, projectId, version } = get();
        if (!spaceId || !projectId) {
          return;
        }
        // 服务端数据同步延迟
        await new Promise<void>(resolve => setTimeout(() => resolve(), 700));
        return get().fetchResource(spaceId, projectId, version, callback);
      },
      setCanClosePopover: (canClose: boolean) => {
        set({ canClosePopover: canClose });
      },
    }),
    {
      name: 'projectIDE.primarySidebar',
      enabled: IS_DEV_MODE,
    },
  ),
);
