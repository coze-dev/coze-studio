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
import { UploadStatus } from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { CustomError } from '@coze-arch/bot-error';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { getBase64, getFileExtension } from '../../utils';

export const customRequest: UploadProps['customRequest'] = async options => {
  const { onSuccess, onError, onProgress, file } = options;

  try {
    // business
    const { name, fileInstance } = file;

    if (fileInstance) {
      const extension = getFileExtension(name);

      const base64 = await getBase64(fileInstance);
      const result = await DeveloperApi.UploadFile(
        {
          file_head: {
            file_type: extension,
            biz_type: FileBizType.BIZ_BOT_DATASET,
          },
          data: base64,
        },
        {
          onUploadProgress: e => {
            const status = file?.status;
            const response = file?.response;
            // Success or failure, after the inspection fails, or if the interface data is returned, the progress bar will not be updated.
            if (
              status === UploadStatus.SUCCESS ||
              status === UploadStatus.UPLOAD_FAIL ||
              status === UploadStatus.VALIDATE_FAIL ||
              response?.upload_url
            ) {
              return;
            }

            const { total, loaded } = e;
            if (total !== undefined && loaded < total) {
              onProgress({
                total: e.total ?? fileInstance.size,
                loaded: e.loaded,
              });
            }
          },
        },
      );
      onSuccess(result.data);
    } else {
      onError({
        status: 0,
      });
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: REPORT_EVENTS.KnowledgeUploadFile,
        error: new CustomError(
          REPORT_EVENTS.KnowledgeUploadFile,
          `${REPORT_EVENTS.KnowledgeUploadFile}: Failed to upload file`,
        ),
      });
    }
  } catch (e) {
    const error = e as Error;
    onError({
      status: 0,
    });
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: REPORT_EVENTS.KnowledgeUploadFile,
      error,
    });
  }
};
