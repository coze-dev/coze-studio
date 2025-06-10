import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { upLoadFile } from '@coze-arch/bot-utils';
import { Toast } from '@coze-arch/bot-semi';

export const useUploadImage = ({
  onUploadError,
  onUploadSuccess,
}: {
  onUploadSuccess: (param: { url: string; uri: string }) => void;
  onUploadError: () => void;
}) => {
  const handleError = () => {
    onUploadError();
    Toast.error({
      content: I18n.t('Upload_failed'),
      showClose: false,
    });
  };

  const upload = async (file: File) => {
    let uri: string, url: string;
    try {
      uri = await upLoadFile({
        biz: 'workflow',
        fileType: 'image',
        file,
      });
    } catch {
      handleError();
      return;
    }
    if (!uri) {
      handleError();
      return;
    }

    try {
      const data = await workflowApi.SignImageURL({
        uri,
        Scene: 'AUDIT',
      });
      url = data.url;
      if (!url) {
        handleError();
        return;
      }
    } catch {
      onUploadError();
      return;
    }
    onUploadSuccess({
      uri,
      url,
    });
  };

  return {
    upload,
  };
};
