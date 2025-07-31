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

import React, {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  type RefObject,
} from 'react';

import {
  useCreateWorkflowModal,
  WorkflowModalFrom,
} from '@coze-workflow/components';
import {
  type ResourceFolderProps,
  type ResourceType,
  useProjectId,
  useSpaceId,
} from '@coze-project-ide/framework';
import {
  BizResourceContextMenuBtnType,
  type BizResourceType,
  BizResourceTypeEnum,
  type ResourceFolderCozeProps,
  useOpenResource,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';
import { workflowApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { WORKFLOW_SUB_TYPE_ICON_MAP } from '@/constants';
import { WorkflowTooltip } from '@/components';

import { useResourceOperation } from './use-resource-operation';
import { useNameValidators } from './use-name-validators';
import { useImportLibraryWorkflow } from './use-import-library-workflow';
import { useChangeFlowMode } from './use-change-flow-mode';
type UseWorkflowResourceReturn = Pick<
  ResourceFolderCozeProps,
  | 'onCustomCreate'
  | 'onDelete'
  | 'onChangeName'
  | 'onAction'
  | 'createResourceConfig'
  | 'iconRender'
> & { modals: ReactNode };

// eslint-disable-next-line @coze-arch/max-line-per-function
export const useWorkflowResource = (): UseWorkflowResourceReturn => {
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const openResource = useOpenResource();
  const currentResourceRef = useRef<BizResourceType>();
  const nameValidators = useNameValidators({
    currentResourceRef: currentResourceRef as RefObject<
      BizResourceType | undefined
    >,
  });
  const {
    createWorkflowModal,
    workflowModal: templateWorkflowModal,
    openCreateModal,
    handleEditWorkflow,
  } = useCreateWorkflowModal({
    from: WorkflowModalFrom.ProjectAddWorkflowResource,
    spaceId,
    projectId,
    hiddenTemplateEntry: true,
    nameValidators,
    refreshPage: () => {
      currentResourceRef.current = undefined;
      refetch?.();
    },
    onCreateSuccess: async ({ workflowId }) => {
      await refetch?.();
      openResource({
        resourceType: BizResourceTypeEnum.Workflow,
        resourceId: workflowId,
      });
    },
  });

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = (
    resourceType,
    subType,
  ) => {
    console.log('[ResourceFolder]on custom create>>>', resourceType, subType);
    openCreateModal(subType as WorkflowMode);
  };

  const onChangeName: ResourceFolderProps['onChangeName'] = useCallback(
    async changeNameEvent => {
      try {
        console.log('[ResourceFolder]on change name>>>', changeNameEvent);
        const resp = await workflowApi.UpdateWorkflowMeta({
          space_id: spaceId,
          workflow_id: changeNameEvent.id,
          name: changeNameEvent.name,
        });
        console.log('[ResourceFolder]rename workflow response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]rename workflow error>>>', e);
      } finally {
        refetch();
      }
    },
    [refetch, spaceId],
  );

  const updateDesc = useCallback(
    async (resource?: BizResourceType) => {
      if (!resource?.res_id) {
        return;
      }
      currentResourceRef.current = resource;
      const resp = await workflowApi.GetWorkflowDetail({
        space_id: spaceId,
        workflow_ids: [resource?.res_id],
      });
      const workflowInfo = resp?.data?.[0];
      if (!workflowInfo) {
        return;
      }
      handleEditWorkflow({
        space_id: workflowInfo.space_id,
        workflow_id: workflowInfo.workflow_id,
        url: workflowInfo.icon,
        icon_uri: workflowInfo.icon_uri,
        name: workflowInfo.name,
        desc: workflowInfo.desc,
      });
    },
    [spaceId, handleEditWorkflow],
  );

  const onDelete = useCallback(
    async (resources: ResourceType[]) => {
      try {
        console.log('[ResourceFolder]on delete>>>', resources);
        console.log('delete start>>>', Date.now());
        const resp = await workflowApi.BatchDeleteWorkflow({
          space_id: spaceId,
          workflow_id_list: resources
            .filter(r => r.type === BizResourceTypeEnum.Workflow)
            .map(r => r.id),
        });
        console.log('delete end>>>', Date.now());
        Toast.success(I18n.t('Delete_success'));
        refetch().then(() => console.log('refetch end>>>', Date.now()));
        console.log('[ResourceFolder]delete workflow response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]delete workflow error>>>', e);
        Toast.error(I18n.t('Delete_failed'));
      }
    },
    [refetch, spaceId],
  );

  const { modal: workflowModal, importLibrary } = useImportLibraryWorkflow({
    projectId,
  });
  const changeFlowMode = useChangeFlowMode();
  const resourceOperation = useResourceOperation({ projectId });
  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    switch (action) {
      case BizResourceContextMenuBtnType.ImportLibraryResource:
        return importLibrary();
      case BizResourceContextMenuBtnType.DuplicateResource:
        return resourceOperation({
          scene: ResourceCopyScene.CopyProjectResource,
          resource,
        });
      case BizResourceContextMenuBtnType.MoveToLibrary:
        return resourceOperation({
          scene: ResourceCopyScene.MoveResourceToLibrary,
          resource,
        });
      case BizResourceContextMenuBtnType.CopyToLibrary:
        return resourceOperation({
          scene: ResourceCopyScene.CopyResourceToLibrary,
          resource,
        });
      case BizResourceContextMenuBtnType.UpdateDesc:
        return updateDesc(resource);
      case BizResourceContextMenuBtnType.SwitchToChatflow:
        return changeFlowMode(
          WorkflowMode.ChatFlow,
          resource?.res_id ?? '',
          spaceId,
        );
      case BizResourceContextMenuBtnType.SwitchToWorkflow:
        return changeFlowMode(
          WorkflowMode.Workflow,
          resource?.res_id ?? '',
          spaceId,
        );
      default:
        console.warn('[WorkflowResource]unsupported action>>>', action);
        break;
    }
  };

  const createResourceConfig = useMemo(
    () =>
      [
        {
          icon: WORKFLOW_SUB_TYPE_ICON_MAP[WorkflowMode.Workflow],
          label: I18n.t('project_resource_sidebar_create_new_resource', {
            resource: I18n.t('library_resource_type_workflow'),
          }),
          subType: WorkflowMode.Workflow,
          tooltip: <WorkflowTooltip flowMode={WorkflowMode.Workflow} />,
        },
        // The open-source version does not currently support conversation streaming
        IS_OPEN_SOURCE
          ? null
          : {
              icon: WORKFLOW_SUB_TYPE_ICON_MAP[WorkflowMode.ChatFlow],
              label: I18n.t('project_resource_sidebar_create_new_resource', {
                resource: I18n.t('wf_chatflow_76'),
              }),
              subType: WorkflowMode.ChatFlow,
              tooltip: <WorkflowTooltip flowMode={WorkflowMode.ChatFlow} />,
            },
      ].filter(Boolean) as ResourceFolderCozeProps['createResourceConfig'],
    [],
  );

  const iconRender: ResourceFolderCozeProps['iconRender'] = useMemo(
    () =>
      ({ resource }) =>
        (
          <>
            {
              WORKFLOW_SUB_TYPE_ICON_MAP[
                resource.res_sub_type || WorkflowMode.Workflow
              ]
            }
          </>
        ),
    [],
  );

  return {
    onChangeName,
    onAction,
    onDelete,
    onCustomCreate,
    createResourceConfig,
    iconRender,
    modals: [workflowModal, createWorkflowModal, templateWorkflowModal],
  };
};
