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
import { I18n } from '@coze-arch/i18n';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { Toast } from '@coze-arch/coze-design';

import { getFileExtension, getUint8Array } from '../../utils';
import { UNIT_MAX_MB, PDF_MAX_PAGES } from '../../constants';

export const getBeforeUpload: (params: {
  maxSizeMB: UploadProps['maxSize'];
}) => UploadProps['beforeUpload'] =
  ({ maxSizeMB }) =>
  async fileInfo => {
    // The reason for not limiting by the maxSize property is
    // Only the beforeUpload hook can change validateMessage
    const res = {
      fileInstance: fileInfo.file.fileInstance,
      status: fileInfo.file.status,
      validateMessage: fileInfo.file.validateMessage,
      shouldUpload: true,
      autoRemove: false,
    };

    const { fileInstance } = fileInfo.file;

    if (!fileInstance) {
      return {
        ...res,
        status: UploadStatus.UPLOAD_FAIL,
        shouldUpload: false,
      };
    }

    const resultMaxSizeMB = maxSizeMB || UNIT_MAX_MB;

    const maxSize = resultMaxSizeMB * 1024 * 1024;

    if (fileInstance.size > maxSize) {
      Toast.warning({
        showClose: false,
        content: I18n.t('file_too_large', {
          max_size: `${resultMaxSizeMB}MB`,
        }),
      });

      return {
        ...res,
        shouldUpload: false,
        status: UploadStatus.VALIDATE_FAIL,
        validateMessage: I18n.t('file_too_large', {
          max_size: `${resultMaxSizeMB}MB`,
        }),
      };
    }

    if (getFileExtension(fileInstance.name).toLowerCase() === 'pdf') {
      try {
        // TODO: Subsequent pdfjs calls from other locations should also be changed to asynchronous loading
        const pdfjs = await import('@coze-arch/pdfjs-shadow');
        const { getDocument, initPdfJsWorker } = pdfjs;

        initPdfJsWorker();
        const uint8Array = await getUint8Array(fileInstance);
        const pdfDocument = await getDocument({ data: uint8Array }).promise;
        if (pdfDocument.numPages > PDF_MAX_PAGES) {
          Toast.warning({
            showClose: false,
            content: I18n.t('atasets_createpdf_over250'),
          });
          return {
            shouldUpload: false,
            status: UploadStatus.VALIDATE_FAIL,
          };
        }
      } catch (e) {
        const error = e as Error;
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeParseFile,
          error,
        });
        if (error?.name === 'PasswordException') {
          Toast.error({
            showClose: false,
            content: I18n.t('pdf_encrypted'),
          });
          return {
            shouldUpload: false,
            status: UploadStatus.VALIDATE_FAIL,
          };
        }
      }
    }
    return res;
  };
