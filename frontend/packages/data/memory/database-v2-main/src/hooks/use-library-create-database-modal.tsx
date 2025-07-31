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

import { useRef, useState, useMemo } from 'react';

import { userStoreService } from '@coze-studio/user-store';
import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { useDataNavigate } from '@coze-data/knowledge-stores';
import { ModalMode } from '@coze-data/database-v2-base/components/base-info-modal';
import { useDatabaseCreateTableModal } from '@coze-data/database-v2-adapter/components/create-table-modal';
import {
  useDatabaseInfoModal,
  type FormData,
} from '@coze-data/database-v2-adapter/components/base-info-modal';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  BotTableRWMode,
  type SingleDatabaseResponse,
} from '@coze-arch/bot-api/memory';

export const enum Step {
  BASE_INFO = 0,
  CREATE_TABLE = 1,
}
export const useLibraryCreateDatabaseModal = ({
  projectID,
  onFinish,
}: {
  projectID?: string;
  onFinish?: (databaseID: string, draftId: string) => void;
  enterFrom?: 'library' | 'project';
}) => {
  const step = useRef<Step>(Step.BASE_INFO);

  const resourceNavigate = useDataNavigate();

  const spaceId = useSpaceStore(store => store.getSpaceId());
  const userId = userStoreService.useUserInfo()?.user_id_str;

  const [databaseBaseInfo, setDatabaseBaseInfo] = useState<FormData>({
    name: '',
    description: '',
    icon_uri: [
      {
        uri: '',
        url: '',
        uid: '',
      },
    ],
  });

  const tableInitData: DatabaseInfo = useMemo(
    () => ({
      tableId: '',
      name: databaseBaseInfo?.name,
      desc: databaseBaseInfo?.description,
      icon_uri: databaseBaseInfo.icon_uri?.[0]?.uri,
      readAndWriteMode: BotTableRWMode.LimitedReadWrite,
      tableMemoryList: [],
    }),
    [databaseBaseInfo],
  );

  const handleBaseInfoSubmit = (data: FormData) => {
    setDatabaseBaseInfo(data);
    step.current = Step.CREATE_TABLE;
    closeDatabaseInfoModal();
    open();
  };

  const handleCreateTableSubmit = (createRes: SingleDatabaseResponse) => {
    const { id, draft_id } = createRes.database_info ?? {};
    if (id && draft_id) {
      if (onFinish) {
        // Bot binding database needs draft_id, other scenarios generally only need to use id
        onFinish(id, draft_id);
        return;
      } else {
        resourceNavigate.toResource?.('database', id, {
          page_modal: 'normal',
          from: 'create',
        });
        close();
      }
    }
  };

  // onReturn
  const handleCreateTableModalClose = () => {
    step.current = Step.BASE_INFO;
    open();
    closeCreateTableModal();
  };

  // onClose
  const handleCloseCreateTable = () => {
    console.log('open');
    step.current = Step.BASE_INFO;
    open();
  };

  const close = () => {
    closeDatabaseInfoModal();
    closeCreateTableModal();
    step.current = Step.BASE_INFO;
  };

  const {
    modal: databaseInfoModal,
    open: openDatabaseInfoModal,
    close: closeDatabaseInfoModal,
  } = useDatabaseInfoModal({
    onSubmit: handleBaseInfoSubmit,
    initValues: databaseBaseInfo,
    mode: ModalMode.CREATE,
  });

  const {
    modal: createTableModal,
    open: openCreateTableModal,
    close: closeCreateTableModal,
  } = useDatabaseCreateTableModal({
    onClose: handleCloseCreateTable,
    onReturn: handleCreateTableModalClose,
    onSubmit: handleCreateTableSubmit,
    initValue: tableInitData,
    showDatabaseBaseInfo: true,
    onlyShowDatabaseInfoRWMode: true,
    extraParams: {
      spaceId,
      creatorId: userId,
    },
    projectID,
  });

  const open = () => {
    if (step.current === Step.BASE_INFO) {
      openDatabaseInfoModal();
    } else {
      openCreateTableModal();
    }
  };

  const modal = (
    <>
      {databaseInfoModal}
      {createTableModal}
    </>
  );

  return {
    modal,
    open,
    close,
  };
};
