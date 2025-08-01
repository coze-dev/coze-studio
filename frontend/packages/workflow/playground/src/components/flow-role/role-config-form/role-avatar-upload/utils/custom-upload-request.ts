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

import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type customRequestArgs } from '@coze-arch/bot-semi/Upload';
import { CustomError } from '@coze-arch/bot-error';
import {
  type UploadFileData,
  type FileBizType,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import getBase64 from './get-base64';

function customUploadRequest(
  options: Omit<customRequestArgs, 'onSuccess'> & {
    fileBizType: FileBizType;
    onSuccess: (data?: UploadFileData) => void;
    beforeUploadCustom?: () => void;
    afterUploadCustom?: () => void;
  },
): void {
  const {
    onSuccess,
    onError,
    file,
    beforeUploadCustom,
    afterUploadCustom,
    fileBizType,
  } = options;

  if (typeof file === 'string') {
    return;
  }
  beforeUploadCustom?.();
  const getFileExtension = (name: string) => {
    const index = name.lastIndexOf('.');
    return name.slice(index + 1);
  };
  try {
    const { fileInstance } = file;

    // business
    if (fileInstance) {
      const extension = getFileExtension(file.name);

      //   business
      (async () => {
        try {
          const base64 = await getBase64(fileInstance);
          const result = await DeveloperApi.UploadFile({
            file_head: {
              file_type: extension,
              biz_type: fileBizType,
            },
            data: base64,
          });
          onSuccess?.(result.data);
          afterUploadCustom?.();
        } catch (error) {
          // If parameter validation fails, it will go to catch.
          afterUploadCustom?.();
        }
      })();
    } else {
      afterUploadCustom?.();
      throw new CustomError(ReportEventNames.parmasValidation, I18n.t('error'));
    }
  } catch (e) {
    afterUploadCustom?.();
    onError?.({
      status: 0,
    });
  }
}

export default customUploadRequest;
