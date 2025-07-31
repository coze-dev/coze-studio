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

import { isFile } from '@coze-common/chat-uikit';
import { ContentType } from '@coze-common/chat-core';

import { FileStatus, type Message } from '../store/types';
import { type MessagesStore } from '../store/messages';

export const buildInProcessSentMessage = (
  message: Message<ContentType, unknown>,
  { useMessagesStore }: { useMessagesStore: MessagesStore },
) => {
  if (
    message.content_type === ContentType.File &&
    isFile(message.content_obj) &&
    message.content_obj.file_list?.[0]
  ) {
    message.content_obj.file_list?.forEach(
      file => (file.upload_status = FileStatus.Success),
    );
    message.content = JSON.stringify(message.content_obj);
  }
};
