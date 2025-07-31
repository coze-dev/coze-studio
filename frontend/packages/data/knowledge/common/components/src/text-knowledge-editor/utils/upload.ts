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

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const LIMIT_SIZE = 20 * 1024 * 1024;
export const isValidSize = (size: number) => LIMIT_SIZE > size;

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;

      if (!result || typeof result !== 'string') {
        reject(new CustomError('getBase64', 'file read invalid'));
        return;
      }

      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.onerror = () => {
      Toast.error(I18n.t('read_file_failed_please_retry'));
      reject(new CustomError('getBase64', 'file read fail'));
    };
    fileReader.onabort = () => {
      reject(new CustomError('getBase64', 'file read abort'));
    };
    fileReader.readAsDataURL(file);
  });

export const getUint8Array = (file: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = event => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      } else {
        reject(new CustomError('getUint8Array', 'file read invalid'));
      }
    };

    fileReader.readAsArrayBuffer(file);
  });

export const getFileExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
};
