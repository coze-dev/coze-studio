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

    // 业务
    if (fileInstance) {
      const extension = getFileExtension(file.name);

      //   业务
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
          // 如参数校验失败情况会走到catch
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
