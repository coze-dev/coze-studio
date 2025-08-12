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

/* eslint-disable max-lines-per-function */
import { useState } from 'react';

import { nanoid } from 'nanoid';
import { workflowApi, type ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { upLoadFile } from '@coze-arch/bot-utils';
import { CustomError } from '@coze-arch/bot-error';
import { Toast } from '@coze-arch/coze-design';

import { FileItemStatus } from '../file-icon';
import { validate } from './utils';
import { type FileItem } from './types';
import { MAX_IMAGE_SIZE, MAX_FILE_SIZE } from './constants';

export interface UploadConfig {
  initialValue?: FileItem[];
  customValidate?: (file: FileItem) => Promise<string | undefined>;
  timeout?: number;
  fileType?: 'object' | 'image';
  multiple?: boolean;
  maxSize?: number;
  inputType?: ViewVariableType;
  accept?: string;
  maxFileCount?: number;
}

export const useUpload = (props?: UploadConfig) => {
  const {
    initialValue = [],
    customValidate,
    timeout,
    fileType,
    multiple = true,
    maxSize,
    accept,
    maxFileCount = 20,
  } = props || {};
  const [fileList, setFileList] = useState(initialValue);
  const isUploading = fileList.some(
    file => file.status === FileItemStatus.Uploading,
  );

  const updateFileItemProps = (uid, fileItemProps) => {
    setFileList(prevList => {
      const newList = [...prevList];
      const index = newList.findIndex(item => item.uid === uid);
      if (index !== -1) {
        Object.keys(fileItemProps).forEach(key => {
          newList[index][key] = fileItemProps[key];
        });
      }

      return newList;
    });
  };

  const uploadFileWithProgress = async file => {
    let progressTimer;

    try {
      const doUpload = async () =>
        await upLoadFile({
          biz: 'workflow',
          fileType,
          file,
          getProgress: percent => {
            updateFileItemProps(file.uid, {
              percent,
            });
          },
        });

      if (timeout) {
        progressTimer = setTimeout(() => {
          throw new Error('Upload timed out');
        }, timeout);
      }

      const uri = await doUpload();

      if (!uri) {
        throw new CustomError('normal_error', 'no uri');
      }

      // Upload complete, clear timeout timer
      clearTimeout(progressTimer);

      // Add uri and get the url.
      const { url } = await workflowApi.SignImageURL(
        {
          uri,
        },
        {
          __disableErrorToast: true,
        },
      );

      if (!url) {
        throw new Error(I18n.t('imageflow_upload_error'));
      }

      updateFileItemProps(file.uid, {
        url,
        status: FileItemStatus.Success,
      });

      return url;
    } catch (error) {
      updateFileItemProps(file.uid, {
        validateMessage: error.message || 'upload failed',
        status: FileItemStatus.ValidateFail,
      });
      clearTimeout(progressTimer);
    }
  };

  const validateFile = async (file: FileItem): Promise<string | undefined> => {
    const validateMsg = await validate(file, {
      customValidate,
      maxSize: maxSize ?? fileType === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE,
      accept,
    });
    if (validateMsg) {
      return validateMsg;
    }
  };

  const upload = async (file: FileItem) => {
    file.status = FileItemStatus.Uploading;
    if (!file.uid) {
      file.uid = nanoid();
    }

    const errorInfo = await validateFile(file);

    if (errorInfo) {
      Toast.error(errorInfo);
      return;
    }

    if (!multiple && fileList[0]) {
      setFileList([]);
    }

    let canUpload = true;

    setFileList(prevList => {
      if (prevList.length >= maxFileCount) {
        Toast.warning(I18n.t('plugin_file_max'));
        canUpload = false;
        return prevList;
      }
      return [...prevList, file];
    });

    if (canUpload) {
      await uploadFileWithProgress(file);
    }
  };

  const deleteFile = (uid?: string) => {
    const index = fileList.findIndex(item => uid === item.uid);

    if (index !== -1 && uid) {
      setFileList(prevList => {
        const newList = [...prevList];
        newList.splice(index, 1);
        return newList;
      });
    }
  };

  return {
    fileList,
    upload,
    isUploading,
    deleteFile,
    setFileList: _fileList => setFileList(_fileList),
  };
};
