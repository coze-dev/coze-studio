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

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type AuthFrequencyInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const saveSettingChange = async (params: {
  datasetId: string;
  pendingAccounts: AuthFrequencyInfo[];
}) => {
  const { datasetId, pendingAccounts } = params;

  try {
    await KnowledgeApi.SetAppendFrequency({
      dataset_id: datasetId,
      auth_frequency_info: pendingAccounts.map(account => ({
        auth_id: account.auth_id,
        auth_frequency_type: account.auth_frequency_type,
      })),
    });
  } catch (error) {
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: REPORT_EVENTS.KnowledgeUpdateWechatFrequency,
      error: error as Error,
    });
    throw error;
  }
};
