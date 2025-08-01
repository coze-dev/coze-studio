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

import { cloneDeep } from 'lodash-es';
import { FILE_TYPE_CONFIG, FileTypeEnum } from '@coze-common/chat-core';
import { type ContentType, type Message } from '@coze-common/chat-core';

export const addFileType = (fileMessage: Message<ContentType.File>) => {
  const copiedFileMessage = cloneDeep(fileMessage);

  if (
    !copiedFileMessage?.content_obj?.file_list ||
    !copiedFileMessage?.content_obj?.file_list.length
  ) {
    return copiedFileMessage;
  }

  const fileList = copiedFileMessage?.content_obj?.file_list;

  for (const targetFile of fileList) {
    if (!targetFile) {
      return copiedFileMessage;
    }

    const { file_name, file_type } = targetFile;

    // TODO: Let's discuss the implementation here again
    const fileType =
      FILE_TYPE_CONFIG.find(
        c =>
          c.fileType === file_type ||
          c.accept.some(ext => file_name.endsWith(ext)),
      )?.fileType ?? FileTypeEnum.DEFAULT_UNKNOWN;

    targetFile.file_type = fileType;
  }

  copiedFileMessage.content = JSON.stringify(copiedFileMessage.content_obj);

  return copiedFileMessage;
};
