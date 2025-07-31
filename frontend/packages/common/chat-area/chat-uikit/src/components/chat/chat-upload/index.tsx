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

import { type FC } from 'react';

import {
  FILE_TYPE_CONFIG,
  FileTypeEnum,
} from '@coze-common/chat-core/shared/const';
import { Toast, Upload } from '@coze-arch/coze-design';
import {
  type IChatUploadCopywritingConfig,
  DEFAULT_MAX_FILE_SIZE,
  UploadType,
} from '@coze-common/chat-uikit-shared';

interface IChatUploadProps {
  /**
   * Upload event callback
   * @param uploadType [IMAGE = 0 FILE = 1]
   * @param file
   * @returns void
   */
  onUpload: (uploadType: UploadType, file: File) => void;
  /**
   * Copywriting information configuration
   */
  copywritingConfig?: IChatUploadCopywritingConfig;
  /**
   * Maximum file size (in bytes)
   */
  maxFileSize?: number;
  isDisabled?: boolean;
  children: JSX.Element;
  limitFileCount?: number;
  isFileCountExceedsLimit: (fileCount: number) => boolean;
}

const findFileTypeConfig = (file: File) =>
  FILE_TYPE_CONFIG.find(
    cnf => cnf.judge?.(file) || cnf.accept.some(ext => file.name.endsWith(ext)),
  );

export const ChatUpload: FC<IChatUploadProps> = props => {
  const {
    copywritingConfig = {},
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    children,
    onUpload,
    isDisabled,
    isFileCountExceedsLimit,
    limitFileCount = 1,
  } = props;

  /**
   * handle uploads
   * @param fileList
   * @returns void
   */
  const handleUpload = (fileList: File[]) => {
    const { fileSizeReachLimitToast, fileExceedsLimitToast, fileEmptyToast } =
      copywritingConfig;

    if (isFileCountExceedsLimit(fileList.length)) {
      Toast.warning({
        showClose: false,
        content: fileExceedsLimitToast,
      });
      return;
    }

    if (!fileList.length) {
      return;
    }

    // Is there a file that is out of size?
    const hasOverflowLimitFileSize = fileList.some(
      file => file.size > maxFileSize,
    );
    const hasEmptyFile = fileList.some(file => file.size <= 0);

    // Error handling if the file size exceeds the expected size
    if (hasOverflowLimitFileSize) {
      Toast.warning({
        showClose: false,
        content: fileSizeReachLimitToast,
      });
    }

    if (hasEmptyFile) {
      Toast.warning({
        showClose: false,
        content: fileEmptyToast,
      });
    }

    const verifiedFileTypeConfigList = fileList
      .filter(file => file.size <= maxFileSize && file.size > 0)
      .map(file => ({
        file,
        fileTypeConfig: findFileTypeConfig(file),
      }));

    for (const fileConfig of verifiedFileTypeConfigList) {
      if (fileConfig.fileTypeConfig?.fileType === FileTypeEnum.IMAGE) {
        onUpload?.(UploadType.IMAGE, fileConfig.file);
      } else {
        onUpload?.(UploadType.FILE, fileConfig.file);
      }
    }
  };

  return (
    <Upload
      limit={limitFileCount === 1 ? 1 : undefined}
      draggable={false}
      action=""
      fileList={[]}
      onFileChange={handleUpload}
      disabled={isDisabled}
      multiple={limitFileCount > 1}
    >
      {children}
    </Upload>
  );
};

ChatUpload.displayName = 'UiKitChatUpload';
