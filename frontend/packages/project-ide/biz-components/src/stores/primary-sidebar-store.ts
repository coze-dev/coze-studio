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
   * Call the refetch method in the store to notify the resource list to refresh
   * @Param resourceType The type of resource to refresh, optional, refresh all types of resources when not passing
   */
  refetch: (callback?: (tree?: BizResourceTree[]) => void) => Promise<void>;
  /**
   * Set the refresh method of the resource list to the store, and call store.refetch (xxx) in other widgets to refresh the resource list
   * @Param refetchFunc refresh method, refresh the setResource in the method that needs to process the resource list internally
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
   * Resource packet expansion status, recorded separately by resource packet type
   */
  groupExpandMap: Record<ProjectResourceGroupType, boolean>;
  /**
   * The currently selected resource
   */
  selectedResource?: string;
  /**
   * Can you close the popover sidebar? It is not allowed to close when the right-click menu is opened, for consumption by the ResourceFolderCoze component
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
        // Server level data synchronization delay
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
