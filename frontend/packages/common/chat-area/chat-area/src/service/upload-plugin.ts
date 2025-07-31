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
  type EventPayloadMaps as BaseEventPayloadMap,
  type FileType,
  type UploadPluginInterface,
} from '@coze-common/chat-core';
import { type CozeUploader } from '@coze-studio/uploader-adapter';

import { uploadFile } from '../utils/upload';

export type EventPayloadMap = BaseEventPayloadMap & {
  ready: boolean;
};
export class UploadPlugin implements UploadPluginInterface {
  file: File;
  fileType: FileType;
  uploader?: CozeUploader;
  eventBus = new EventEmitter();
  userId = '';
  abortController: AbortController;
  constructor(props: { file: File; type: FileType; userId: string }) {
    this.file = props.file;
    this.fileType = props.type;
    this.userId = props.userId;
    this.abortController = new AbortController();
    uploadFile({
      file: this.file,
      fileType: this.fileType,
      userId: this.userId,
      signal: this.abortController.signal,
      onProgress: event => {
        const progressEvent: EventPayloadMap['progress'] = event;
        this.eventBus.emit('progress', progressEvent);
      },
      onUploaderReady: uploader => {
        const readyEvent: EventPayloadMap['ready'] = true;
        this.eventBus.emit('ready', readyEvent);
        this.uploader = uploader;
      },
      onUploadError: event => {
        const errorEvent: EventPayloadMap['error'] = event;
        this.eventBus.emit('error', errorEvent);
      },
      onGetTokenError: error => {
        const errorEvent: EventPayloadMap['error'] = {
          type: 'error',
          extra: {
            error,
            message: error.message,
          },
        };
        this.eventBus.emit('error', errorEvent);
      },
      onSuccess: event => {
        const completeEvent: EventPayloadMap['complete'] = event;
        this.eventBus.emit('complete', completeEvent);
      },
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
    this.uploader?.pause();
    return;
  }
  cancel() {
    this.abortController.abort();
  }
}
