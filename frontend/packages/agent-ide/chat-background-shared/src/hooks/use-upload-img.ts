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

import { useEffect, useRef } from 'react';

import { nanoid } from 'nanoid';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';

// import { type UploadState } from '../type';

import { UploadController } from '../service/upload-controller';

export const useUploadImage = ({
  getUserId,
  onUploadError,
  onUploadAllSuccess,
  onAuditError,
}: {
  getUserId: () => string;
  onUploadAllSuccess: (param: { url: string; uri: string }[]) => void;
  onUploadError: () => void;
  onAuditError?: () => void;
}) => {
  const uploadControllerMap = useRef<Record<string, UploadController>>({});

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
    cancelUploadById(controllerId);
    onUploadError();
    Toast.error({
      content: withSlardarIdButton(I18n.t('Upload_failed')),
      showClose: false,
    });
  };

  const onAuditFailed = () => {
    if (onAuditError) {
      onAuditError();
    } else {
      Toast.error({
        content: I18n.t('inappropriate_contents'),
        showClose: false,
      });
    }
    onUploadError();
  };

  const uploadFileList = (fileList: File[]) => {
    const controllerId = nanoid();

    if (!fileList.length) {
      return;
    }

    uploadControllerMap.current[controllerId] = new UploadController({
      fileList,
      controllerId,
      userId: getUserId(),
      onComplete: event => {
        onUploadAllSuccess(event);
      },
      onUploadError: handleError,
      onGetTokenError: handleError,
      onGetUploadInstanceError: handleError,
      onAuditFailed,
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
    uploadFileList,
  };
};
