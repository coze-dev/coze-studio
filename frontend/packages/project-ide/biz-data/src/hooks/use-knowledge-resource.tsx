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

import { type ReactNode, useCallback } from 'react';

import {
  type ResourceFolderProps,
  type ResourceType,
  useProjectId,
  useSpaceId,
  useIDENavigate,
} from '@coze-project-ide/framework';
import {
  BizResourceContextMenuBtnType,
  type BizResourceType,
  BizResourceTypeEnum,
  type ResourceFolderCozeProps,
  // useOpenResource,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import { useCreateKnowledgeModalV2 } from '@coze-data/knowledge-modal-adapter';
import { I18n } from '@coze-arch/i18n';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';
import { DatasetStatus } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { useResourceOperation } from './use-resource-operation';

// import { useImportLibraryKnowledge } from './use-import-library-knowledge';

type UseKnowledgeResourceReturn = Pick<
  ResourceFolderCozeProps,
  | 'onCustomCreate'
  | 'onDelete'
  | 'onChangeName'
  | 'onAction'
  | 'createResourceConfig'
  | 'iconRender'
> & { modals: ReactNode };

const useKnowledgeResource = (): UseKnowledgeResourceReturn => {
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const spaceId = useSpaceId();
  const projectID = useProjectId();
  const IDENav = useIDENavigate();
  // const openResource = useOpenResource();

  // Creating knowledge
  const {
    modal: createKnowledgeModal,
    open: openCreateKnowledgeModal,
    close,
  } = useCreateKnowledgeModalV2({
    projectID,
    onFinish: (datasetID, unitType, shouldUpload) => {
      refetch();
      close();
      IDENav(
        `/knowledge/${datasetID}?type=${unitType}${
          shouldUpload ? '&module=upload' : ''
        }`,
      );
    },
  });

  // Update knowledge status, mainly to disable enable
  const updateKnowledge = async (
    datasetID: string,
    datasetName: string,
    status: DatasetStatus,
  ) => {
    try {
      await KnowledgeApi.UpdateDataset({
        dataset_id: datasetID,
        name: datasetName,
        status,
      });
    } catch (e) {
      console.log('[ResourceFolder]update knowledge error>>>', e);
    } finally {
      refetch();
    }
  };

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = () => {
    openCreateKnowledgeModal();
  };

  const onChangeName: ResourceFolderProps['onChangeName'] =
    async changeNameEvent => {
      try {
        await KnowledgeApi.UpdateDataset({
          dataset_id: changeNameEvent.id,
          name: changeNameEvent.name,
        });
      } catch (e) {
        console.log('[ResourceFolder]rename knowledge error>>>', e);
      } finally {
        refetch();
      }
    };

  const onDelete = useCallback(
    async (resources: ResourceType[]) => {
      try {
        await KnowledgeApi.DeleteDataset({
          dataset_id: resources.filter(
            r => r.type === BizResourceTypeEnum.Knowledge,
          )?.[0].res_id,
        });
        Toast.success(I18n.t('Delete_success'));
        refetch();
      } catch (e) {
        Toast.error(I18n.t('Delete_failed'));
      }
    },
    [refetch, spaceId],
  );

  const resourceOperation = useResourceOperation({ projectId: projectID });
  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    switch (action) {
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
      case BizResourceContextMenuBtnType.DisableKnowledge:
        if (resource?.id) {
          updateKnowledge(
            resource.id,
            resource.name,
            DatasetStatus.DatasetForbid,
          );
        }
        break;
      case BizResourceContextMenuBtnType.EnableKnowledge:
        if (resource?.id) {
          updateKnowledge(
            resource.id,
            resource.name,
            DatasetStatus.DatasetReady,
          );
        }
        break;
      default:
        break;
    }
  };

  return {
    onChangeName,
    onAction,
    onDelete,
    onCustomCreate,
    modals: [createKnowledgeModal],
  };
};

export default useKnowledgeResource;
