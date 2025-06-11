import { type FileMessageContent } from '@coze-common/chat-core';

export type IFileInfo = FileMessageContent['file_list'][0] & {
  upload_status?: number;
  upload_percent?: number;
};

export interface IFileUploadInfo {
  status: 'uploading' | 'uploaded' | 'failed';
  percent: number;
}

export interface IFileAttributeKeys {
  statusKey: string;
  statusEnum: {
    successEnum: number;
    failEnum: number;
    cancelEnum: number;
    uploadingEnum: number;
  };
  percentKey: string;
}

export interface IFileCardTooltipsCopyWritingConfig {
  cancel: string;
  copy: string;
  retry: string;
}
