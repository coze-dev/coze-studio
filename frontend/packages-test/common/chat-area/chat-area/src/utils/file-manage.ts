import EventEmitter from 'eventemitter3';
import { type UploadPluginInterface } from '@coze-common/chat-core';

import { type EventPayloadMap } from '../service/upload-plugin';

export const fileManager = new EventEmitter();

export const enum FileManagerEventNames {
  CANCEL_UPLOAD_FILE = 'CANCEL_UPLOAD_FILE',
}

interface IFileUploaderMap {
  [key: string]: UploadPluginInterface<EventPayloadMap>;
}

const fileUploaderMap: IFileUploaderMap = {};

export const addFileUploader = ({
  localMessageId,
  uploader,
}: {
  localMessageId: string;
  uploader: UploadPluginInterface<EventPayloadMap>;
}) => {
  fileUploaderMap[localMessageId] = uploader;
};

export const removeFileUploader = (localMessageId?: string) => {
  if (!localMessageId) {
    return;
  }
  fileUploaderMap[localMessageId]?.cancel();
  delete fileUploaderMap[localMessageId];
};

export const removeAllFileUploader = () => {
  Object.keys(fileUploaderMap).forEach(messageId =>
    removeFileUploader(messageId),
  );
};

export const destroyFileManager = () => {
  fileManager.removeAllListeners();
  removeAllFileUploader();
};
