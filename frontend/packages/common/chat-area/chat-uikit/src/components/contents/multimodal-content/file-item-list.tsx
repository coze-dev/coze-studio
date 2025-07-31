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

import { type FileMixItem } from '@coze-common/chat-core';
import {
  type IFileAttributeKeys,
  type IOnCopyUploadParams,
  type IOnRetryUploadParams,
  type IOnCancelUploadParams,
  type IMessage,
  type IFileCopywritingConfig,
  type Layout,
} from '@coze-common/chat-uikit-shared';

import FileCard from '../file-content/components/FileCard';
import { isFileMixItem } from '../../../utils/multimodal';

export interface FileItemListProps {
  message: IMessage;
  fileItemList: FileMixItem[];
  fileAttributeKeys?: IFileAttributeKeys;
  fileCopywriting?: IFileCopywritingConfig;
  readonly?: boolean;
  layout: Layout;
  showBackground: boolean;
  onCancel?: (params: IOnCancelUploadParams) => void;
  onCopy?: (params: IOnCopyUploadParams) => void;
  onRetry?: (params: IOnRetryUploadParams) => void;
}

export const FileItemList: FC<FileItemListProps> = ({
  fileItemList,
  fileAttributeKeys,
  fileCopywriting,
  readonly,
  onRetry,
  onCancel,
  onCopy,
  message,
  layout,
  showBackground,
}) => {
  /**
   * Handle the event of clicking Cancel Upload
   */
  const handleCancel = () => {
    onCancel?.({ message, extra: {} });
  };

  /**
   * Handling events that retry uploads
   */
  const handleRetry = () => {
    onRetry?.({ message, extra: {} });
  };

  /**
   * Handling events that copy file addresses
   */
  const handleCopy = () => {
    onCopy?.({ message, extra: {} });
  };

  return (
    <>
      {fileItemList.map(item => {
        if (isFileMixItem(item) && fileAttributeKeys) {
          return (
            <FileCard
              className="chat-uikit-multi-modal-file-image-content select-none"
              key={item.file.file_key}
              file={item.file}
              attributeKeys={fileAttributeKeys}
              tooltipsCopywriting={fileCopywriting?.tooltips}
              readonly={readonly}
              onCancel={handleCancel}
              onCopy={handleCopy}
              onRetry={handleRetry}
              layout={layout}
              showBackground={showBackground}
            />
          );
        }
        return null;
      })}
    </>
  );
};
