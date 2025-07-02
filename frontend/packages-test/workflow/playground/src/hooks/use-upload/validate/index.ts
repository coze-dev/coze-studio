import { type FileItem } from '../types';
import { sizeValidate } from './size-validate';
import { imageSizeValidate, type ImageSizeRule } from './image-size-validate';
import { acceptValidate } from './accept-validate';

interface UploadValidateRule {
  maxSize?: number;
  imageSize?: ImageSizeRule;
  accept?: string;
  customValidate?: (file: FileItem) => Promise<string | undefined>;
}

export const validate = async (file: FileItem, rules?: UploadValidateRule) => {
  const { size, name } = file;

  const { maxSize, imageSize, accept, customValidate } = rules || {};

  const validators = [
    async () => await customValidate?.(file),
    () => sizeValidate(size, maxSize),
    async () => await imageSizeValidate(file, imageSize),
    () => acceptValidate(name, accept),
  ];

  for await (const validator of validators) {
    const errorMsg = await validator();
    if (errorMsg) {
      return errorMsg;
    }
  }
};
