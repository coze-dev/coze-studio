export const getFileListByDragOrPaste = (
  e: HTMLElementEventMap['drop'] | HTMLElementEventMap['paste'],
): File[] => {
  let fileList: FileList | undefined;
  if ('dataTransfer' in e) {
    fileList = e.dataTransfer?.files;
  } else {
    fileList = e.clipboardData?.files;
  }
  if (!fileList) {
    return [];
  }
  return formatTypeFileListToTypeArray(fileList);
};

export const formatTypeFileListToTypeArray = (fileList: FileList) => {
  const fileLength = fileList.length;
  const fileArray: (File | null)[] = [];
  for (let i = 0; i < fileLength; i++) {
    fileArray.push(fileList.item(i));
  }
  return fileArray.filter((file): file is File => Boolean(file));
};
