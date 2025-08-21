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

import { useRequest } from 'ahooks';
import {
  ActionKey,
  type ResourceInfo,
  ResType,
} from '@coze-arch/idl/plugin_develop';
import { I18n } from '@coze-arch/i18n';
import { IconCozDatabase } from '@coze-arch/coze-design/icons';
import { Menu, Table, Toast } from '@coze-arch/coze-design';
import { MemoryApi } from '@coze-arch/bot-api';
import { useLibraryCreateDatabaseModal } from '@coze-data/database-v2';

import { type UseEntityConfigHook } from './types';

const { TableAction } = Table;

export const useDatabaseConfig: UseEntityConfigHook = ({
  spaceId,
  reloadList,
  getCommonActions,
}) => {
  const navigate = useNavigate();

  const {
    modal: createDatabaseModal,
    open: openCreateDatabaseModal,
    close: closeCreateDatabaseModal,
  } = useLibraryCreateDatabaseModal({
    enterFrom: 'library',
    onFinish: databaseID => {
      navigate(
        `/space/${spaceId}/database/${databaseID}?page_modal=normal&biz=create`,
      );
      closeCreateDatabaseModal();
    },
  });
  // delete action
  const { run: deleteDatabase } = useRequest(
    (databaseId: string) =>
      MemoryApi.DeleteDatabase({
        id: databaseId,
      }),
    {
      manual: true,
      onSuccess: () => {
        reloadList();
        Toast.success(I18n.t('Delete_success'));
      },
    },
  );

  return {
    modals: <>{createDatabaseModal}</>,
    config: {
      typeFilter: {
        label: I18n.t('new_db_001'),
        value: ResType.Database,
      },
      onCreate: openCreateDatabaseModal,
      renderCreateMenu: () => (
        <Menu.Item
          data-testid="workspace.library.header.create.card"
          icon={<IconCozDatabase />}
          onClick={openCreateDatabaseModal}
        >
          {I18n.t('new_db_001')}
        </Menu.Item>
      ),
      target: [ResType.Database],
      onItemClick: (item: ResourceInfo) => {
        navigate(
          `/space/${spaceId}/database/${item.res_id}?page_mode=normal&from=library`,
        );
      },
      renderActions: (item: ResourceInfo) => {
        // Can it be deleted?
        const deleteDisabled = !item.actions?.find(
          action => action.key === ActionKey.Delete,
        )?.enable;
        // Whether to enable

        // delete operation
        const deleteProps = {
          disabled: deleteDisabled,
          deleteDesc: I18n.t('library_delete_desc'),
          handler: () => {
            deleteDatabase(item.res_id || '');
          },
        };

        return (
          <TableAction
            deleteProps={deleteProps}
            actionList={getCommonActions?.(item)}
          />
        );
      },
    },
  };
};
