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

import { useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';

import { type UploadState } from '../type';
import { UploadController } from '../service/upload-controller';
/**
 * There is no scene for the time being, so the ability to upload multiple files with multiple instances and one line is blocked here.
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

  const handleAuditFailed = (controllerId: string) => {
    clearState();
    cancelUploadById(controllerId);
    Toast.error({
      content: withSlardarIdButton(I18n.t('inappropriate_contents')),
      showClose: false,
    });
  };

  const handleUploadSuccess = () => {
    clearState();
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
      onAuditFailed: handleAuditFailed,
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
