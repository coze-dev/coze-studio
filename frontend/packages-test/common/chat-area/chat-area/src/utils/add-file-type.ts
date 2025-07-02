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

    // TODO: 再讨论下这里的实现
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
