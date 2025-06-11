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
   * 处理点击取消上传的事件
   */
  const handleCancel = () => {
    onCancel?.({ message, extra: {} });
  };

  /**
   * 处理重试上传的事件
   */
  const handleRetry = () => {
    onRetry?.({ message, extra: {} });
  };

  /**
   * 处理拷贝文件地址的事件
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
