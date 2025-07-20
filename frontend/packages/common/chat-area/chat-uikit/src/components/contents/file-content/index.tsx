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

import classNames from 'classnames';
import {
  type IFileAttributeKeys,
  type IOnRetryUploadParams,
  type IOnCancelUploadParams,
  type IOnCopyUploadParams,
  type IFileCopywritingConfig,
  type IBaseContentProps,
  type Layout,
} from '@coze-common/chat-uikit-shared';

import { safeJSONParse } from '../../../utils/safe-json-parse';
import { isFile } from '../../../utils/is-file';
import FileCard from './components/FileCard';

export type IProps = IBaseContentProps & {
  copywriting?: IFileCopywritingConfig;
  fileAttributeKeys?: IFileAttributeKeys;
  onCancel?: (params: IOnCancelUploadParams) => void;
  onRetry?: (params: IOnRetryUploadParams) => void;
  onCopy?: (params: IOnCopyUploadParams) => void;
  layout: Layout;
  showBackground: boolean;
};

export const FileContent: FC<IProps> = props => {
  const {
    message,
    copywriting,
    fileAttributeKeys,
    readonly,
    onCancel,
    onCopy,
    onRetry,
    layout,
    showBackground,
  } = props;

  const { content_obj = safeJSONParse(message.content) } = message;

  /**
   * 判断是否为文件类型的卡片 或者 没有配置file属性config则拒绝使用该卡片
   */
  if (
    !isFile(content_obj) ||
    !fileAttributeKeys ||
    content_obj.file_list.length <= 0
  ) {
    return null;
  }

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
  const handleCopy = (fileIndex?: number) => {
    onCopy?.({ message, extra: { fileIndex } });
  };

  return (
    <>
      {content_obj.file_list.map((file, index) => (
        <FileCard
          file={file}
          attributeKeys={fileAttributeKeys}
          tooltipsCopywriting={copywriting?.tooltips}
          readonly={readonly}
          onCancel={handleCancel}
          onCopy={() => handleCopy(index)}
          onRetry={handleRetry}
          layout={layout}
          showBackground={showBackground}
          className={classNames({
            'mb-[8px]': index < content_obj.file_list.length - 1,
          })}
        />
      ))}
    </>
  );
};

FileContent.displayName = 'FileContent';
