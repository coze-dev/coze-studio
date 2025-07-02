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
