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

import { EventEmitter } from 'eventemitter3';
import {
  type UploadPluginInterface,
  type FileType,
} from '@coze-common/chat-core';
import { FileStatus } from '@coze-common/chat-area';

import { type OpenApiSource } from '@/types/open';
import { type EventPayloadMap } from '@/types/core';

export interface UploadFileData {
  uri: string;
  url: string;
}

export type UploadFileApi = (props: {
  file: File;
  botId: string;
  source: OpenApiSource;
  token?: string;
  onProgress?: (percent: number) => void;
}) => Promise<UploadFileData>;

export const createSDKUploadPluginClass = ({
  botId,
  source,
  token,
  uploadFile,
}: {
  botId: string;
  source: OpenApiSource;
  token?: string;
  uploadFile: UploadFileApi;
}) =>
  class SDKUploadPlugin implements UploadPluginInterface {
    file: File;
    fileType: FileType;
    eventBus = new EventEmitter();
    /**
     * 目前用不到 只是为了对齐 core&area 类型
     */
    // @ts-expect-error -- linter-disable-autofix
    userId: string;
    // @ts-expect-error -- linter-disable-autofix
    abortController: AbortController;

    constructor(props: { file: File; type: FileType; userId: string }) {
      this.file = props.file;
      this.fileType = props.type;

      this.upload()
        .then(meta => {
          this.eventBus.emit('complete', {
            percent: 100,
            status: FileStatus.Success,
            uploadResult: {
              Uri: meta.uri,
              Url: meta.url,
            },
            type: 'success',
          });
        })
        .catch(err => {
          this.eventBus.emit('error');
        });
    }

    start() {
      return;
    }

    on<T extends keyof EventPayloadMap>(
      eventName: T,
      callback: (info: EventPayloadMap[T]) => void,
    ) {
      this.eventBus.on(eventName, callback);
    }

    pause() {
      return;
    }

    cancel() {
      return;
    }

    async upload() {
      this.eventBus.emit('ready', {
        percent: 0,
        status: FileStatus.Uploading,
      });

      const result = await uploadFile({
        source,
        botId,
        file: this.file,
        token,
        onProgress: percent => {
          this.eventBus.emit('progress', {
            percent,
            status: FileStatus.Uploading,
          });
        },
      });

      return result;
    }
  };
