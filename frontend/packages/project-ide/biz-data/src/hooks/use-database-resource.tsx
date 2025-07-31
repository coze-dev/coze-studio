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
import { useLibraryCreateDatabaseModal } from '@coze-data/database-v2';
import { I18n } from '@coze-arch/i18n';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';
import { MemoryApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { useResourceOperation } from './use-resource-operation';

// import { useImportLibraryDatabase } from './use-import-library-database';

type UseDatabaseResourceReturn = Pick<
  ResourceFolderCozeProps,
  | 'onCustomCreate'
  | 'onDelete'
  | 'onChangeName'
  | 'onAction'
  | 'createResourceConfig'
  | 'iconRender'
> & { modals: ReactNode };

const useDatabaseResource = (): UseDatabaseResourceReturn => {
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const IDENav = useIDENavigate();
  // const openResource = useOpenResource();

  // Create Database
  const {
    modal: createDatabaseModal,
    open: openCreateDatabaseModal,
    close: closeCreateDatabaseModal,
  } = useLibraryCreateDatabaseModal({
    projectID: projectId,
    enterFrom: 'project',
    onFinish: databaseID => {
      refetch();
      closeCreateDatabaseModal();
      IDENav(`/database/${databaseID}?page_modal=normal&from=create`);
    },
  });

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = (
    resourceType,
    subType,
  ) => {
    console.log('[ResourceFolder]on custom create>>>', resourceType, subType);
    openCreateDatabaseModal();
  };

  const onChangeName: ResourceFolderProps['onChangeName'] =
    async changeNameEvent => {
      try {
        console.log('[ResourceFolder]on change name>>>', changeNameEvent);
        const resp = await MemoryApi.UpdateDatabase({
          id: changeNameEvent.id,
          table_name: changeNameEvent.name,
        });
        console.log('[ResourceFolder]rename database response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]rename database error>>>', e);
      } finally {
        refetch();
      }
    };

  const onDelete = useCallback(
    async (resources: ResourceType[]) => {
      try {
        console.log('[ResourceFolder]on delete>>>', resources);
        const resp = await MemoryApi.DeleteDatabase({
          id: resources.filter(
            r => r.type === BizResourceTypeEnum.Database,
          )?.[0].res_id,
        });
        Toast.success(I18n.t('Delete_success'));
        refetch();
        console.log('[ResourceFolder]delete database response>>>', resp);
      } catch (e) {
        console.log('[ResourceFolder]delete database error>>>', e);
        Toast.error(I18n.t('Delete_failed'));
      }
    },
    [refetch, spaceId],
  );

  // const { modal: databaseModal, importLibrary } = useImportLibraryDatabase({
  //   projectId,
  // });

  const resourceOperation = useResourceOperation({ projectId });
  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    console.log('on action>>>', action, resource);
    switch (action) {
      case BizResourceContextMenuBtnType.ImportLibraryResource:
        // return importLibrary();
        // return openDatabase();
        return;
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
      default:
        console.warn('[DatabaseResource]unsupported action>>>', action);
        break;
    }
  };

  return {
    onChangeName,
    onAction,
    onDelete,
    onCustomCreate,
    // createResourceConfig,
    modals: [createDatabaseModal],
  };
};

export default useDatabaseResource;
