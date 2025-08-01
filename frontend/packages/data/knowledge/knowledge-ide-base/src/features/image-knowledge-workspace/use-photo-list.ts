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

import { type InfiniteScrollOptions } from 'ahooks/lib/useInfiniteScroll/types';
import { useInfiniteScroll } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { KNOWLEDGE_MAX_DOC_SIZE } from '@coze-data/knowledge-modal-base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type PhotoInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { FilterPhotoType } from '@/types';

export interface UsePhotoListParams {
  datasetID: string;
  searchValue?: string;
  filterPhotoType?: FilterPhotoType;
}

interface Result {
  list: PhotoInfo[];
  total: number;
}

const PAGE_SIZE = 20;

export const usePhotoList = (
  params: UsePhotoListParams,
  options: InfiniteScrollOptions<Result>,
) => {
  const { datasetID, searchValue, filterPhotoType } = params;

  const fetchPhotoList = async (
    page: number,
    pageSize: number,
    // @ts-expect-error -- linter-disable-autofix
  ): Promise<Result> => {
    try {
      const res = await KnowledgeApi.ListPhoto({
        page: page ?? 1,
        size: pageSize ?? KNOWLEDGE_MAX_DOC_SIZE,
        dataset_id: datasetID,
        filter: {
          keyword: searchValue,
          has_caption:
            filterPhotoType === FilterPhotoType.HasCaption
              ? true
              : filterPhotoType === FilterPhotoType.NoCaption
              ? false
              : // Pass undefined to return all
                undefined,
        },
      });
      return {
        list: res.photo_infos || [],
        total: res.total || 0,
      };
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: REPORT_EVENTS.KnowledgePhotoList,
        error: error as Error,
      });
    }
  };

  return useInfiniteScroll<Result>(
    async d => {
      const p = d ? Math.ceil(d.list.length / PAGE_SIZE) + 1 : 1;
      return fetchPhotoList(p, PAGE_SIZE);
    },
    {
      manual: true,
      ...options,
    },
  );
};
