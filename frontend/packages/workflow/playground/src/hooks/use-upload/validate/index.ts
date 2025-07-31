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
