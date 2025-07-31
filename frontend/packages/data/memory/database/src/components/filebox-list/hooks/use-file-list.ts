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
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type FileVO } from '@coze-arch/bot-api/filebox';
import { fileboxApi } from '@coze-arch/bot-api';

import { type FileBoxListType } from '../types';
import { COZE_CONNECTOR_ID } from '../const';

export interface UseFileListParams {
  botId: string;
  searchValue?: string;
  type: FileBoxListType;
}

export interface Result {
  list: FileVO[];
  total: number;
}

const PAGE_SIZE = 20;

export const useFileList = (
  params: UseFileListParams,
  options: InfiniteScrollOptions<Result>,
) => {
  const { botId, searchValue, type } = params;

  const fetchFileList = async (
    page: number,
    pageSize: number,
  ): Promise<Result> => {
    let result: Result = {
      list: [],
      total: 0,
    };
    try {
      const res = await fileboxApi.FileList({
        // The front end starts counting from 1, which is convenient for Math.ceil calculation. When passing to the back end, manually subtract 1.
        page_num: page - 1,
        page_size: pageSize,
        bid: botId,
        file_name: searchValue,
        file_type: type,
        connector_id: COZE_CONNECTOR_ID,
      });
      result = {
        list: res.list || [],
        total: res.total_count || 0,
      };
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.FILEBOX, {
        eventName: REPORT_EVENTS.FileBoxListFile,
        error: error as Error,
      });
    }
    return result;
  };

  return useInfiniteScroll<Result>(
    async d => {
      const p = d ? Math.ceil(d.list.length / PAGE_SIZE) + 1 : 1;
      return fetchFileList(p, PAGE_SIZE);
    },
    {
      manual: true,
      ...options,
    },
  );
};
