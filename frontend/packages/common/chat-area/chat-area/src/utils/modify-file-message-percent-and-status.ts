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
