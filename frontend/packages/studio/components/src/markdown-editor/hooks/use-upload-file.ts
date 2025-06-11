import { useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';

import { type UploadState } from '../type';
import { UploadController } from '../service/upload-controller';

/**
 * 暂时没有场景，所以这里将多实例、一次行上传多文件的能力屏蔽了
 */
export const useUpload = ({
  getUserId,
  onUploadAllSuccess,
}: {
  getUserId: () => string;
  onUploadAllSuccess: (param: { url: string; fileName: string }) => void;
}) => {
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  const uploadControllerMap = useRef<Record<string, UploadController>>({});

  const clearState = () => setUploadState(null);

  const deleteUploadControllerById = (id: string) => {
    delete uploadControllerMap.current[id];
  };
  const cancelUploadById = (id: string) => {
    const controller = uploadControllerMap.current[id];
    if (!controller) {
      return;
    }
    controller.cancel();
    deleteUploadControllerById(id);
  };

  const handleError = (_e: unknown, controllerId: string) => {
    clearState();
    cancelUploadById(controllerId);
    Toast.error({
      content: withSlardarIdButton(I18n.t('Upload_failed')),
      showClose: false,
    });
  };

  const handleUploadSuccess = () => {
    setUploadState(null);
  };

  const handleProgress = (percent: number) => {
    setUploadState(state => {
      if (!state) {
        return state;
      }
      return { ...state, percent };
    });
  };

  const handleStartUpload = (fileName: string) =>
    setUploadState({ fileName, percent: 0 });

  const uploadFileList = (fileList: File[]) => {
    if (uploadState) {
      return;
    }

    const controllerId = nanoid();

    const file = fileList.at(0);
    if (!file) {
      return;
    }
    handleStartUpload(file.name);

    uploadControllerMap.current[controllerId] = new UploadController({
      fileList,
      controllerId,
      userId: getUserId(),
      onProgress: event => {
        handleProgress(event.percent);
      },
      onComplete: event => {
        handleUploadSuccess();
        onUploadAllSuccess(event);
      },
      onUploadError: handleError,
      onGetTokenError: handleError,
      onGetUploadInstanceError: handleError,
    });
  };

  const clearAllSideEffect = () => {
    Object.entries(uploadControllerMap.current).forEach(([, controller]) =>
      controller.cancel(),
    );
    uploadControllerMap.current = {};
  };

  useEffect(() => clearAllSideEffect, []);

  return {
    uploadState,
    uploadFileList,
  };
};
