/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import mime from 'mime-types';
import { isNil } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { getFileExtension } from '../file-icon';
import { type FileItem } from './types';
import { MAX_FILE_SIZE } from './constants';

interface UploadValidateRule {
  maxSize?: number;
  imageSize?: ImageSizeRule;
  accept?: string;
  customValidate?: (file: FileItem) => Promise<string | undefined>;
}

/**
 * Format file size
 * @param bytes file size
 * @Param decimals, default 2 digits
 * @example
 * formatBytes(1024);       // 1KB
 * formatBytes('1024');     // 1KB
 * formatBytes(1234);       // 1.21KB
 * formatBytes(1234, 3);    // 1.205KB
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024,
    dm = decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

/** file size verification  */
export const sizeValidate = (
  size: number,
  maxSize: number = MAX_FILE_SIZE,
): string | undefined => {
  if (maxSize && size > maxSize) {
    return I18n.t('imageflow_upload_exceed', {
      size: formatBytes(maxSize),
    });
  }
};

export interface ImageSizeRule {
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  aspectRatio?: number;
}

/**
 * Get the width and height of the image
 */
export async function getImageSize(
  file: FileItem,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = e => {
      reject(e);
    };
    img.src = url;
  });
}

/** image width check  */
// eslint-disable-next-line complexity
export const imageSizeValidate = async (
  file: FileItem,
  rule?: ImageSizeRule,
): Promise<string | undefined> => {
  const { maxWidth, minWidth, maxHeight, minHeight, aspectRatio } = rule || {};

  // No validation when undefined
  if (isNil(maxWidth || minWidth || maxHeight || minHeight || aspectRatio)) {
    return;
  }

  const { width, height } = await getImageSize(file);

  if (maxWidth && width > maxWidth) {
    return I18n.t('imageflow_upload_error5', {
      value: `${maxWidth}px`,
    });
  }

  if (minWidth && width < minWidth) {
    return I18n.t('imageflow_upload_error3', {
      value: `${minWidth}px`,
    });
  }

  if (maxHeight && height > maxHeight) {
    return I18n.t('imageflow_upload_error4', {
      value: `${maxHeight}px`,
    });
  }

  if (minHeight && height < minHeight) {
    return I18n.t('imageflow_upload_error2', {
      value: `${minHeight}px`,
    });
  }
  if (aspectRatio && width / height > aspectRatio) {
    return I18n.t('imageflow_upload_error1');
  }
};

export const acceptValidate = (fileName: string, accept?: string) => {
  if (!accept) {
    return;
  }
  const acceptList = accept.split(',');

  const fileExtension = getFileExtension(fileName);
  const mimeType = mime.lookup(fileExtension);

  // Image/* matches all image types
  if (acceptList.includes('image/*') && mimeType?.startsWith?.('image/')) {
    return undefined;
  }

  if (!acceptList.includes(`.${fileExtension}`)) {
    return I18n.t('imageflow_upload_error_type', {
      type: `${acceptList.filter(Boolean).join('/')}`,
    });
  }
};

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
