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

/**
 * Service definition: contains business processes & events
 */
import { useMemo } from 'react';

import { type StoreApi, type UseBoundStore } from 'zustand';
import { get } from 'lodash-es';
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { transformUnitList, getFileExtension, getBase64 } from '@/utils';
import {
  type UploadTableAction,
  type UploadTableState,
} from '@/features/knowledge-type/table/interface';

/** Use tos_uri to get table_info when uploading table-local */
export const useUploadFetchTableParams = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const unitList = useStore(state => state.unitList);
  return useMemo(
    () => ({
      tos_uri: get(unitList, '0.uri', ''),
      document_source: DocumentSource.Document,
    }),
    [unitList],
  );
};

/**
 * table-local add upload onRetry
 */
export const useRetry = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const setUnitList = useStore(state => state.setUnitList);
  const unitList = useStore(state => state.unitList);

  const onRetry = async (record: UnitItem, index: number) => {
    try {
      const { fileInstance } = record;
      if (fileInstance) {
        const { name } = fileInstance;
        const extension = getFileExtension(name);
        const base64 = await getBase64(fileInstance);
        const result = await DeveloperApi.UploadFile({
          file_head: {
            file_type: extension,
            biz_type: FileBizType.BIZ_BOT_DATASET,
          },
          data: base64,
        });

        setUnitList(
          transformUnitList({
            unitList,
            data: result?.data,
            fileInstance,
            index,
          }),
        );
      }
    } catch (e) {
      // TODO plus report
      console.log(e);
    }
  };
  return onRetry;
};
