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

import { useRequest } from 'ahooks';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

export const useGetKnowledgeListInfo = (params: { datasetID: string }) => {
  const spaceId = useSpaceStore(s => s.space.id);
  const cacheKey = `dataset-${params.datasetID}`;
  const capture = useErrorHandler();
  return useRequest(
    async () => {
      if (!params.datasetID) {
        throw new CustomError(
          'useListDataSetReq_error',
          'datasetid cannot be empty',
        );
      }
      const res = await KnowledgeApi.ListDataset({
        filter: {
          dataset_ids: [params.datasetID],
        },
        space_id: spaceId,
      });

      if (res?.total) {
        return res?.dataset_list?.find(i => i.dataset_id === params.datasetID);
      } else if (res?.total !== 0) {
        capture(new CustomError('useListDataSetReq_error', res.msg || ''));
      }
    },
    {
      cacheKey,
      setCache: data => sessionStorage.setItem(cacheKey, JSON.stringify(data)),
      getCache: () => JSON.parse(sessionStorage.getItem(cacheKey) || '{}'),
      onError: error => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
        capture(error);
      },
    },
  );
};
