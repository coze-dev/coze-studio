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
