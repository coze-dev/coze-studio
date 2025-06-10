import { type ClipboardEvent } from 'react';

import { nanoid } from 'nanoid';

import { getFileListByPaste } from '../../utils/upload';
import { usePreference } from '../../context/preference';
import { useValidateFileList } from './use-validate-file-list';
import { useCreateFileAndUpload } from './use-upload';

export const usePasteUpload = () => {
  const uploadFile = useCreateFileAndUpload();
  const { fileLimit, enablePasteUpload } = usePreference();
  const validateFileList = useValidateFileList();

  return (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!enablePasteUpload) {
      return;
    }

    const fileList = getFileListByPaste(e);

    // 如果粘贴的文件数量为空，则返回
    if (!fileList.length) {
      return;
    }

    // 阻止默认的粘贴行为
    e.preventDefault();

    const verifiedFileList = validateFileList({ fileLimit, fileList });

    // 文件校验
    if (!verifiedFileList.length) {
      return;
    }

    verifiedFileList.forEach(file => {
      uploadFile(nanoid(), file);
    });
  };
};
