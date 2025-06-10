import { nanoid } from 'nanoid';
import { type LiteralExpression } from '@coze-workflow/base';

import { type FileItem } from '../../../hooks/use-upload';

export const transformExpressionInputToFileList = (
  value?: LiteralExpression,
): FileItem[] => {
  if (!value) {
    return [];
  }

  let fileList: FileItem[] = [];

  const { rawMeta, content } = value;

  const { fileName } = rawMeta || {};

  if (Array.isArray(content)) {
    fileList = content.map((item, index) => ({
      url: item,
      name: fileName?.[index],
      uid: nanoid(),
    })) as FileItem[];
  } else {
    if (content) {
      fileList = [
        {
          url: content,
          name: fileName,
          uid: nanoid(),
        },
      ] as FileItem[];
    }
  }

  return fileList;
};
