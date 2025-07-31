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

import {
  uploadFileV2,
  type EventPayloadMaps as BaseEventPayloadMap,
  type UploaderInstance,
  type UploadFileV2Param,
  type FileItem,
} from '@coze-arch/bot-utils/upload-file-v2';
import { PlaygroundApi } from '@coze-arch/bot-api';

export type EventPayloadMap = BaseEventPayloadMap & {
  ready: boolean;
};

export interface UploadControllerProps {
  controllerId: string;
  fileList: File[];
  userId: string;
  onProgress?: (
    event: EventPayloadMap['progress'],
    controllerId: string,
  ) => void;
  onComplete?: (
    event: {
      url: string;
      fileName: string;
    },
    controllerId: string,
  ) => void;
  onUploadError?: (event: Error, controllerId: string) => void;
  onUploaderReady?: (
    event: EventPayloadMap['ready'],
    controllerId: string,
  ) => void;
  onStartUpload?: (
    param: Parameters<Required<UploadFileV2Param>['onStartUpload']>[number],
    controllerId: string,
  ) => void;
  onGetUploadInstanceError?: (error: Error, controllerId: string) => void;
  onGetTokenError?: (error: Error, controllerId: string) => void;
}

const isImage = (file: File) => file.type.startsWith('image/');

export class UploadController {
  controllerId: string;
  abortController: AbortController;
  uploader: UploaderInstance | null;
  fileItemList: FileItem[];

  constructor({
    controllerId,
    fileList,
    userId,
    onProgress,
    onComplete,
    onUploadError,
    onUploaderReady,
    onStartUpload,
    onGetTokenError,
    onGetUploadInstanceError,
  }: UploadControllerProps) {
    this.fileItemList = fileList.map(file => ({
      file,
      fileType: isImage(file) ? 'image' : 'object',
    }));
    this.controllerId = controllerId;
    this.abortController = new AbortController();
    this.uploader = null;
    uploadFileV2({
      fileItemList: this.fileItemList,
      userId,
      signal: this.abortController.signal,
      timeout: undefined,
      onUploaderReady: uploader => {
        this.uploader = uploader;
        onUploaderReady?.(true, controllerId);
      },
      onProgress: event => onProgress?.(event, controllerId),
      onSuccess: async event => {
        const uri = event.uploadResult.Uri;
        try {
          if (!uri) {
            throw new Error(
              `upload success without uri, uploadID ${event.uploadID}`,
            );
          }

          const result = await PlaygroundApi.GetImagexShortUrl({
            uris: [uri],
          });

          const url = result.data?.url_info?.[uri]?.url;

          if (!url) {
            throw new Error(`failed to get url, uri: ${uri}`);
          }

          onComplete?.(
            { url, fileName: event.uploadResult.FileName ?? '' },
            controllerId,
          );
        } catch (e) {
          onUploadError?.(
            e instanceof Error ? e : new Error(String(e)),
            controllerId,
          );
        }
      },
      onUploadError: event => onUploadError?.(event.extra.error, controllerId),
      onStartUpload: event => onStartUpload?.(event, controllerId),
      onGetUploadInstanceError: error =>
        onGetUploadInstanceError?.(error, controllerId),
      onGetTokenError: error => onGetTokenError?.(error, controllerId),
    });
  }

  cancel = () => {
    this.abortController.abort();
  };

  pause = () => {
    this.uploader?.pause();
  };
}
