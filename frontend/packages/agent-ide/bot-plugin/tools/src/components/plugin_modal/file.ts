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

import { type AssistParameterType } from '@coze-arch/bot-api/plugin_develop';
import {
  FILE_TYPE_CONFIG,
  type FileTypeEnum,
} from '@coze-studio/file-kit/logic';
import { ACCEPT_UPLOAD_TYPES } from '@coze-studio/file-kit/config';

import { assistToExtend, parameterTypeExtendMap } from './config';

export const getFileAccept = (type: AssistParameterType) => {
  const { fileTypes } = parameterTypeExtendMap[assistToExtend(type)];

  const accept = fileTypes?.reduce((prev, curr) => {
    const config = FILE_TYPE_CONFIG.find(c => c.fileType === curr);

    if (!config) {
      return prev;
    }

    prev = `${prev}${prev ? ',' : ''}${config.accept.join(',')}`;

    return prev;
  }, '');

  if (!accept || accept === '*') {
    return undefined;
  }

  return accept;
};

export const getFileTypeFromAssistType = (
  type: AssistParameterType,
): FileTypeEnum | null => {
  if (!type) {
    return null;
  }

  const extendType = assistToExtend(type);

  const config = Object.entries(parameterTypeExtendMap).find(
    ([key]) => Number(key) === extendType,
  );

  if (!config) {
    return null;
  }

  for (const fileType of config[1].fileTypes) {
    const iconConfig = ACCEPT_UPLOAD_TYPES[fileType];

    if (iconConfig) {
      return fileType;
    }
  }

  return null;
};
