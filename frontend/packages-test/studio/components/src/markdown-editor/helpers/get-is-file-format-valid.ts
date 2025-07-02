export const getIsFileFormatValid = (file: File) =>
  file.type.startsWith('image/') && file.type !== 'image/svg+xml';
