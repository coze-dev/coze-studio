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
