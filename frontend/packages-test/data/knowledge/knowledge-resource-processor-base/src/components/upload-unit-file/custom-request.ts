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
    // 业务
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
            // 成功或失败、检验失败后，或者有返回接口数据，不再更新进度条
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
