import { type PropsWithChildren } from 'react';

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { CustomError } from '@coze-arch/bot-error';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { Upload, Toast, type customRequestArgs } from '@coze/coze-design';

import { getBase64, getFileExtension, isValidSize } from '../utils';

import styles from './index.module.less';

interface CustomUploadProps {
  customRequest: UploadProps['customRequest'];
}

export const CustomUpload: React.FC<PropsWithChildren<CustomUploadProps>> = ({
  customRequest,
  children,
}) => (
  <Upload
    className={styles['segment-editor-upload']}
    accept="image/*"
    maxSize={20480}
    fileList={[]}
    customRequest={customRequest}
    onChange={fileItem => {
      const { currentFile } = fileItem;
      if (currentFile) {
        const isValid = isValidSize(currentFile?.fileInstance?.size || 0);
        if (!isValid) {
          Toast.error(I18n.t('knowledge_insert_img_013'));
        }
      }
    }}
  >
    {children}
  </Upload>
);

export interface CustomRequestParams {
  object: customRequestArgs;
  options: {
    onFinish?: (result: { url?: string; tosKey?: string }) => void;
    onFinally?: () => void;
    onBeforeUpload?: () => void;
  };
}

export const handleCustomUploadRequest = async ({
  object,
  options,
}: CustomRequestParams) => {
  const { onSuccess, onProgress, file } = object;
  const { onFinish, onFinally, onBeforeUpload } = options;

  if (typeof file === 'string') {
    return;
  }

  try {
    // 业务逻辑
    onBeforeUpload?.();
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
            onProgress({
              total: e.total ?? fileInstance.size,
              loaded: e.loaded,
            });
          },
        },
      );
      onSuccess(result.data);
      if (result.data) {
        onFinish?.({
          url: result.data.upload_url,
          tosKey: result.data.upload_uri,
        });
      }
    } else {
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: ReportEventNames.KnowledgeUploadFile,
        error: new CustomError(
          ReportEventNames.KnowledgeUploadFile,
          `${ReportEventNames.KnowledgeUploadFile}: Failed to upload image`,
        ),
      });
    }
  } catch (error) {
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: ReportEventNames.KnowledgeUploadFile,
      error: error as Error,
    });
  } finally {
    onFinally?.();
  }
};
