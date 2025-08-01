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

import { type StoreApi, type UseBoundStore } from 'zustand';
import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  CreateUnitStatus,
  type ProgressItem,
} from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { useDocIdFromQuery } from '@/utils';
import { type TableItem } from '@/types/table';
import { usePollingTaskProgress } from '@/hooks';
import {
  type UploadTableAction,
  type UploadTableState,
} from '@/features/knowledge-type/table/index';
import { TableStatus } from '@/constants';

export const useUpdateDocument = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const tableData = useStore(state => state.tableData);
  const setStatus = useStore(state => state.setStatus);
  const setCreateStatus = useStore(state => state.setCreateStatus);
  const setProgressList = useStore(state => state.setProgressList);
  const pollingTaskProgress = usePollingTaskProgress();
  const docIdFromQuery = useDocIdFromQuery();

  const { run: handleUpdateDocument } = useRequest(
    async () => {
      try {
        setStatus(TableStatus.LOADING);
        await KnowledgeApi.UpdateDocument({
          document_id: docIdFromQuery,
          table_meta: (tableData?.table_meta?.[0] || []).map(
            (item: TableItem) => ({
              column_name: item.column_name,
              column_type: item.column_type,
              desc: item.desc,
              id: item?.is_new_column ? '0' : item.id,
              is_semantic: item.is_semantic,
              sequence: item.sequence,
            }),
          ),
        });
        await pollingTaskProgress(
          [
            {
              document_id: docIdFromQuery,
            },
          ],
          {
            onProgressing: (progressList: ProgressItem[]) => {
              setProgressList(progressList);
            },
            onFinish: () => {
              setCreateStatus(CreateUnitStatus.TASK_FINISH);
            },
          },
        );
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateDocument,
          error: error as Error,
        });
      } finally {
        setStatus(TableStatus.NORMAL);
      }
    },
    {
      manual: true,
    },
  );
  return handleUpdateDocument;
};
