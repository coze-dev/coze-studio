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

import Uploader, { type ImageXFileOption } from 'tt-uploader';
import {
  type Config,
  type STSToken,
  type ObjectSync,
} from '@coze-arch/uploader-interface';

export interface FileOption {
  file: Blob;
  stsToken: STSToken;
  type?: any;
  callbackArgs?: string;
  testHost?: string;
  objectSync?: ObjectSync;
}

export const getUploader = (config: Config, isOversea?: boolean) => {
  const imageHost = (
    config.imageHost ||
    config.imageFallbackHost ||
    ''
  ).replace(/^https:\/\//, config.schema ? `${config.schema}://` : '');
  const uploader = new Uploader({
    /**
     * The schema needs to be dynamically obtained according to the deployment environment of the current user
     * Schema compatibility with special HTTP scenario fields
     */
    schema: config.schema,
    region: isOversea ? 'ap-singapore-1' : 'cn-north-1',
    imageHost,
    appId: config.appId,
    userId: config.userId,
    useFileExtension: config.useFileExtension,
    uploadTimeout: config.uploadTimeout,
    imageConfig: config.imageConfig,
  } as any);

  const originalAddImageFile: (option: ImageXFileOption) => string =
    uploader.addImageFile.bind(uploader);

  uploader.addFile = function (options: FileOption) {
    const imageOptions: ImageXFileOption = {
      file: options.file,
      stsToken: options.stsToken,
    };
    return originalAddImageFile(imageOptions);
  };
  return uploader as CozeUploader;
};

type UploadEventName = 'complete' | 'error' | 'progress' | 'stream-progress';

export type CozeUploader = Uploader & {
  addFile: (options: FileOption) => string;
  removeAllListeners: (eventName: UploadEventName) => void;
};

export {
  type Config,
  type EventPayloadMaps,
} from '@coze-arch/uploader-interface';
