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
