export const getFileExtensionAndName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex < 0) {
    return {
      nameWithoutExtension: fileName,
      extension: '',
    };
  }
  /**
   * eg: .docx
   */
  const extension = fileName.slice(dotIndex);
  const nameWithoutExtension = fileName.slice(0, dotIndex);
  return {
    extension,
    nameWithoutExtension,
  };
};
