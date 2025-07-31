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

import { useEffect } from 'react';

import { type StoreApi, type UseBoundStore } from 'zustand';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';

import { useListDocumentReq } from '@/services';

import { type UploadTableAction, type UploadTableState } from '../interface';

export const useTableCheck = (
  store: UseBoundStore<
    StoreApi<UploadTableState<number> & UploadTableAction<number>>
  >,
) => {
  const params = useKnowledgeParams();
  const setDocumentList = store(state => state.setDocumentList);

  const listDocument = useListDocumentReq(res => {
    const { document_infos = [] } = res;
    setDocumentList && setDocumentList(document_infos);
  });

  useEffect(() => {
    listDocument({
      dataset_id: params.datasetID ?? '',
      document_ids: params.docID ? [params.docID] : undefined,
    });
  }, []);
  return null;
};
