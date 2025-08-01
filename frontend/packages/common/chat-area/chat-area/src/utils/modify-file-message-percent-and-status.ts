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
import { type ContentType } from '@coze-common/chat-core';

import { type FileStatus, type Message } from '../store/types';
import { addFileType } from './add-file-type';

export const modifyFileMessagePercentAndStatus = (
  fileMessage: Message<ContentType.File, unknown>,
  { percent, status }: { percent: number; status: FileStatus },
) => {
  const { content_obj } = addFileType(fileMessage);

  const newContent = {
    file_list: content_obj.file_list.map(fileList => ({
      ...fileList,
      upload_percent: percent,
      upload_status: status,
    })),
  };

  return cloneDeep({
    ...fileMessage,
    content_obj: newContent,
    content: JSON.stringify(newContent),
  });
};
