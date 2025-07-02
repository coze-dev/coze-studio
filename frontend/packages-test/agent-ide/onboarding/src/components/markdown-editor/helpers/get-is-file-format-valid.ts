import { FILE_EXTENSION_LIST } from '../constant/file';

export const getIsFileFormatValid = (file: File) =>
  FILE_EXTENSION_LIST.some(extension => file.name.endsWith(extension));
