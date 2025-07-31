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

import { useMemo } from 'react';

import { ProjectResourceGroupType } from '@coze-arch/bot-api/plugin_develop';

import { usePrimarySidebarStore } from '@/stores';
import { type BizResourceType } from '@/resource-folder-coze';

export const useResourceList = (): {
  workflowResource: BizResourceType[];
  pluginResource: BizResourceType[];
  dataResource: BizResourceType[];
  initLoaded?: boolean;
  isFetching?: boolean;
} => {
  const resourceTree = usePrimarySidebarStore(state => state.resourceTree);
  const isFetching = usePrimarySidebarStore(state => state.isFetching);
  const initLoaded = usePrimarySidebarStore(state => state.initLoaded);

  const workflowResource = useMemo<BizResourceType[]>(
    () =>
      resourceTree.find(
        group => group.groupType === ProjectResourceGroupType.Workflow,
      )?.resourceList || [],
    [resourceTree],
  );
  const pluginResource = useMemo<BizResourceType[]>(
    () =>
      resourceTree.find(
        group => group.groupType === ProjectResourceGroupType.Plugin,
      )?.resourceList || [],
    [resourceTree],
  );
  const dataResource = useMemo<BizResourceType[]>(
    () =>
      resourceTree.find(
        group => group.groupType === ProjectResourceGroupType.Data,
      )?.resourceList || [],
    [resourceTree],
  );
  return {
    workflowResource,
    pluginResource,
    dataResource,
    initLoaded,
    isFetching,
  };
};
