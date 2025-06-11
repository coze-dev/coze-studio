export const findFileDataIndexById = (fileIdList: string[], id: string) => {
  if (!id) {
    return -1;
  }
  return fileIdList.findIndex(fileId => fileId === id);
};

/**
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/type
 * @link https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * 图片类型的 MIME 都以 image/ 开头
 */
export const isImage = (file: File) => file.type.startsWith('image/');
