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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getUploader as initUploader,
  type CozeUploader,
  type EventPayloadMaps,
} from '@coze-studio/uploader-adapter';
import { type GetUploadAuthTokenData } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { getReportError } from './get-report-error';

export { type EventPayloadMaps };

export type UploaderInstance = CozeUploader;

const removeAllListeners = (instance: UploaderInstance) => {
  instance.removeAllListeners('stream-progress');
  instance.removeAllListeners('complete');
  instance.removeAllListeners('error');
  instance.removeAllListeners('progress');
};

export interface FileItem {
  file: File;
  /**
   * Non-image file type is object
   * This seems strange, to align the design of @byted/uploader
   */
  fileType: 'image' | 'object';
}

export interface UploadFileV2Param {
  fileItemList: FileItem[];
  userId: string;
  signal: AbortSignal;
  onProgress?: (event: EventPayloadMaps['progress']) => void;
  onUploaderReady?: (uploader: UploaderInstance) => void;
  onUploadError?: (event: EventPayloadMaps['error']) => void;
  onGetTokenError?: (error: Error) => void;
  onSuccess?: (event: EventPayloadMaps['complete']) => void;
  onUploadAllSuccess?: (event: EventPayloadMaps['complete'][]) => void;
  onStartUpload?: (param: (FileItem & { fileKey: string })[]) => void;
  onGetUploadInstanceError?: (error: Error) => void;
  timeout: number | undefined;
}

/**
 * Improved version upload method
 * 1. Able to support interruption and clear side effects
 * 2. Better callback function
 * 3. Support uploading multiple files at one time
 */
// eslint-disable-next-line max-lines-per-function -- the internal methods are divided into modules, but they all rely on the same context for interruption and cannot be removed
export function uploadFileV2({
  fileItemList,
  userId,
  signal,
  onProgress,
  onUploaderReady,
  onUploadError,
  onGetTokenError,
  onSuccess,
  onUploadAllSuccess,
  onStartUpload,
  timeout = 60000,
  onGetUploadInstanceError,
}: UploadFileV2Param) {
  return new Promise<void>(resolve => {
    let bytedUploader: UploaderInstance | null = null;

    let stopped = false;

    signal?.addEventListener('abort', () => {
      bytedUploader?.cancel();
      if (bytedUploader) {
        removeAllListeners(bytedUploader);
      }
      stopped = true;
      resolve();
    });
    let list: EventPayloadMaps['complete'][] = [];

    const getToken = async () => {
      try {
        const dataAuth = await DeveloperApi.GetUploadAuthToken(
          {
            scene: 'bot_task',
          },
          { timeout },
        );
        const result = dataAuth.data;

        if (!result) {
          throw new Error('Invalid GetUploadAuthToken Response');
        }

        return result;
      } catch (e) {
        onGetTokenError?.(getReportError(e).error);
        throw e;
      }
    };

    const upload = (authToken: GetUploadAuthTokenData) => {
      const { service_id, upload_host, auth, schema } =
        authToken as GetUploadAuthTokenData & { schema?: string };

      const uploader = initUploader(
        {
          schema,
          useFileExtension: true,
          // Solve the error problem:
          userId,
          appId: APP_ID,
          // cp-disable-next-line
          imageHost: `https://${upload_host}`, //imageX upload required
          imageConfig: {
            serviceId: service_id || '', // The service id applied for in the video cloud.
          },
          objectConfig: {
            serviceId: service_id || '',
          },
          imageFallbackHost: IMAGE_FALLBACK_HOST,
          region: BYTE_UPLOADER_REGION,
          uploadTimeout: timeout,
        },
        IS_OVERSEA,
      );
      bytedUploader = uploader;
      onUploaderReady?.(uploader);

      const fileAndKeyList = fileItemList.map(({ file, fileType }) => {
        const fileKey = uploader.addFile({
          file,
          stsToken: {
            CurrentTime: auth?.current_time || '',
            ExpiredTime: auth?.expired_time || '',
            SessionToken: auth?.session_token || '',
            AccessKeyId: auth?.access_key_id || '',
            SecretAccessKey: auth?.secret_access_key || '',
          },
          type: fileType, // Upload file type, three optional values: video (video or audio, default), image (picture), object (normal file)
        });
        return { file, fileType, fileKey };
      });

      onStartUpload?.(fileAndKeyList);
      fileAndKeyList.forEach(fileAndKey => {
        uploader.start(fileAndKey.fileKey);
      });

      uploader.on('complete', inform => {
        onSuccess?.(inform as any);

        list.push(inform as any);
        if (list.length === fileAndKeyList.length) {
          // Assignment in order
          // @ts-expect-error -- linter-disable-autofix
          list = fileAndKeyList.map(({ fileKey }) =>
            list.find(v => v.key === fileKey),
          );
          onUploadAllSuccess?.(list);
        }
      });

      uploader.on('error', inform => {
        onUploadError?.(inform as any);
      });

      uploader.on('progress', inform => {
        onProgress?.(inform as any);
      });
    };

    const start = async () => {
      const [authData] = await Promise.all([getToken()]);
      if (stopped) {
        return;
      }
      upload(authData);
    };

    start();
  });
}
