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
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const useInit = (datasetId: string) => {
  const { data: initAccountList, loading: initLoading } = useRequest(
    async () => {
      const response = await KnowledgeApi.GetAppendFrequency({
        dataset_id: datasetId,
      });
      return response.auth_frequency_info;
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetAuthList,
          error,
        });
      },
    },
  );

  return {
    initAccountList,
    initLoading,
  };
};
