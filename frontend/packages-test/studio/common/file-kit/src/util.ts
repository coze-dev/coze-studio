import { FILE_TYPE_CONFIG } from './file-type';

// 获取文件信息
export const getFileInfo = (file: File) => {
  const fileInfo = FILE_TYPE_CONFIG.find(({ judge, accept }) =>
    judge ? judge(file) : accept.some(ext => file.name.endsWith(ext)),
  );
  if (!fileInfo) {
    return null;
  }
  return fileInfo;
};
