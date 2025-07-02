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
