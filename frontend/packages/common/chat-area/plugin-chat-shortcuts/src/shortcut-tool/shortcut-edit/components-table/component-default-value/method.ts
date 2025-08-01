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

import { FileTypeEnum, getFileInfo } from '@coze-common/chat-core';
import { shortcut_command } from '@coze-arch/bot-api/playground_api';

import { type UploadItemConfig } from '../types';
import { acceptMap, type UploadItemType } from '../../../../utils/file-const';
type FileTypeEnumWithoutDefault = Exclude<
  FileTypeEnum,
  FileTypeEnum.DEFAULT_UNKNOWN
>;

const fileTypeToInputTypeMap: {
  [key in FileTypeEnumWithoutDefault]: UploadItemType;
} = {
  [FileTypeEnum.IMAGE]: shortcut_command.InputType.UploadImage,
  [FileTypeEnum.AUDIO]: shortcut_command.InputType.UploadAudio,
  [FileTypeEnum.PDF]: shortcut_command.InputType.UploadDoc,
  [FileTypeEnum.DOCX]: shortcut_command.InputType.UploadDoc,
  [FileTypeEnum.EXCEL]: shortcut_command.InputType.UploadTable,
  [FileTypeEnum.CSV]: shortcut_command.InputType.UploadTable,
  [FileTypeEnum.VIDEO]: shortcut_command.InputType.VIDEO,
  [FileTypeEnum.PPT]: shortcut_command.InputType.PPT,
  [FileTypeEnum.TXT]: shortcut_command.InputType.TXT,
  [FileTypeEnum.ARCHIVE]: shortcut_command.InputType.ARCHIVE,
  [FileTypeEnum.CODE]: shortcut_command.InputType.CODE,
};

export const getFileTypeFromInputType = (
  inputType: shortcut_command.InputType,
) => {
  for (const [fileType, type] of Object.entries(fileTypeToInputTypeMap)) {
    if (type === inputType) {
      return fileType;
    }
  }
  return null;
};

export const getInputTypeFromFileType = (
  fileType: FileTypeEnumWithoutDefault,
) => fileTypeToInputTypeMap[fileType];

export const getInputTypeFromFile = (file: File): UploadItemType | '' => {
  const fileInfo = getFileInfo(file);
  const fileType = fileInfo?.fileType;
  if (!fileInfo) {
    return '';
  }
  if (!fileType || fileType === FileTypeEnum.DEFAULT_UNKNOWN) {
    return '';
  }
  return getInputTypeFromFileType(fileType);
};

// Determine whether the file exceeds the maximum limit
export const isOverMaxSizeByUploadItemConfig = (
  file: File | undefined,
  config: UploadItemConfig | undefined,
): {
  isOverSize: boolean;
  // Unit MB
  maxSize?: number;
} => {
  if (!file) {
    return {
      isOverSize: false,
    };
  }
  if (!config) {
    return {
      isOverSize: false,
    };
  }
  const inputType = getInputTypeFromFile(file);
  if (!inputType) {
    return {
      isOverSize: false,
    };
  }
  const { maxSize } = config[inputType];
  if (!maxSize) {
    return {
      isOverSize: false,
    };
  }
  return {
    isOverSize: file.size > maxSize * 1024,
    maxSize,
  };
};

// Accept based on acceptUploadItemTypes
export const getAcceptByUploadItemTypes = (
  acceptUploadItemTypes: UploadItemType[],
) => {
  const accept: string[] = [];
  for (const type of acceptUploadItemTypes) {
    if (!type) {
      continue;
    }
    const acceptStr = acceptMap[type];
    if (!acceptStr) {
      continue;
    }
    accept.push(...acceptStr.split(','));
  }
  return accept.join(',');
};
