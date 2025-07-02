import { type ReactNode } from 'react';

import {
  useWorkflowModal,
  WorkflowModalFrom,
  type WorkFlowModalModeProps,
  WorkflowCategory,
} from '@coze-workflow/components';
import {
  BizResourceTypeEnum,
  useOpenResource,
  usePrimarySidebarStore,
  useResourceCopyDispatch,
} from '@coze-project-ide/biz-components';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { resource_resource_common } from '@coze-arch/bot-api/plugin_develop';

import { useNameValidators } from './use-name-validators';

export const useImportLibraryWorkflow = ({
  projectId,
}: {
  projectId: string;
}): {
  modal: ReactNode;
  importLibrary: () => void;
} => {
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const openResource = useOpenResource();
  const importResource = useResourceCopyDispatch();
  const onImport: WorkFlowModalModeProps['onImport'] = async item => {
    try {
      close();
      console.log('[ResourceFolder]import library workflow>>>', item);
      await importResource({
        scene:
          resource_resource_common.ResourceCopyScene.CopyResourceFromLibrary,
        res_id: item.workflow_id,
        res_type: resource_resource_common.ResType.Workflow,
        project_id: projectId,
        res_name: item.name,
      });
    } catch (e) {
      console.error('[ResourceFolder]import library workflow error>>>', e);
    }
  };
  const nameValidators = useNameValidators();
  const { node, open, close } = useWorkflowModal({
    from: WorkflowModalFrom.ProjectImportLibrary,
    flowMode: WorkflowMode.Workflow,
    hiddenExplore: true,
    hiddenCreate: true,
    hiddenWorkflowCategories: [
      WorkflowCategory.Example,
      WorkflowCategory.Project,
    ],
    projectId,
    onImport,
    nameValidators,
    onCreateSuccess: async ({ workflowId }) => {
      close();
      await refetch();
      openResource({
        resourceType: BizResourceTypeEnum.Workflow,
        resourceId: workflowId,
      });
    },
  });

  return { modal: node, importLibrary: open };
};
