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
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import {
  transformUnitList,
  getFileExtension,
  getBase64,
} from '@coze-data/knowledge-resource-processor-base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

export const useRetry = (params: {
  unitList: UnitItem[];
  setUnitList: (unitList: UnitItem[]) => void;
}) => {
  const { unitList, setUnitList } = params;

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
      const error = e as Error;
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: REPORT_EVENTS.KnowledgeUploadFile,
        error,
      });
    }
  };
  return onRetry;
};
