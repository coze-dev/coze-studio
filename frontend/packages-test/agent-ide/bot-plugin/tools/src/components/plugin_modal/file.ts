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
