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

import {
  ZipIcon,
  VideoIcon,
  TextIcon as TxtIcon,
  ImageIcon,
  AudioIcon,
  CodeIcon,
  PptIcon,
  DocxIcon as DocIcon,
  XlsxIcon as TableIcon,
} from '@coze-common/chat-uikit';
import { FILE_TYPE_CONFIG, FileTypeEnum } from '@coze-common/chat-core';
import { I18n } from '@coze-arch/i18n';
import { InputType, shortcut_command } from '@coze-arch/bot-api/playground_api';

export type UploadItemType =
  | InputType.UploadImage
  | InputType.UploadDoc
  | InputType.UploadTable
  | InputType.UploadAudio
  | InputType.CODE
  | InputType.ARCHIVE
  | InputType.PPT
  | InputType.VIDEO
  | InputType.TXT;

export const ACCEPT_UPLOAD_TYPES: {
  type: UploadItemType;
  label: string;
  icon: string;
}[] = [
  {
    type: InputType.UploadImage,
    label: I18n.t('shortcut_modal_upload_component_file_format_img'),
    icon: ImageIcon,
  },
  {
    type: InputType.UploadTable,
    label: I18n.t('shortcut_modal_upload_component_file_format_table'),
    icon: TableIcon,
  },
  {
    type: InputType.UploadDoc,
    label: I18n.t('shortcut_modal_upload_component_file_format_doc'),
    icon: DocIcon,
  },
  {
    type: InputType.UploadAudio,
    label: I18n.t('shortcut_modal_upload_component_file_format_audio'),
    icon: AudioIcon,
  },
  {
    type: InputType.CODE,
    label: I18n.t('shortcut_modal_upload_component_file_format_code'),
    icon: CodeIcon,
  },
  {
    type: InputType.ARCHIVE,
    label: I18n.t('shortcut_modal_upload_component_file_format_zip'),
    icon: ZipIcon,
  },
  {
    type: InputType.PPT,
    label: I18n.t('shortcut_modal_upload_component_file_format_ppt'),
    icon: PptIcon,
  },
  {
    type: InputType.VIDEO,
    label: I18n.t('shortcut_modal_upload_component_file_format_video'),
    icon: VideoIcon,
  },
  {
    type: InputType.TXT,
    label: I18n.t('shortcut_modal_upload_component_file_format_txt'),
    icon: TxtIcon,
  },
];

// Map with file formats supported by chat
export const fileTypeToInputTypeMap = {
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
  [FileTypeEnum.DEFAULT_UNKNOWN]: shortcut_command.InputType.UploadDoc,
};

export const acceptMap = FILE_TYPE_CONFIG.reduce<{
  [key in shortcut_command.InputType]?: string;
}>((acc, cur) => {
  const inputType = fileTypeToInputTypeMap[cur.fileType];
  if (inputType) {
    const preAcc = acc[inputType];
    if (preAcc) {
      acc[inputType] = `${preAcc},${cur.accept.join(',')}`;
    } else {
      acc[inputType] = cur.accept.join(',');
    }
  }
  return acc;
}, {});

// Accept based on acceptUploadItemTypes
export const getAcceptByUploadItemTypes = (
  acceptUploadItemTypes: shortcut_command.InputType[],
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

// Get the corresponding fileInfo according to fileType
export const getFileInfoByFileType = (fileType: FileTypeEnum) => {
  const inputType = fileTypeToInputTypeMap[fileType];
  if (!inputType) {
    return null;
  }
  return ACCEPT_UPLOAD_TYPES.find(item => item.type === inputType);
};

// ACCEPT_UPLOAD_TYPES converted to map
export const getAcceptUploadItemTypesMap = () =>
  ACCEPT_UPLOAD_TYPES.reduce<{
    [key in shortcut_command.InputType]?: string;
  }>((acc, cur) => {
    acc[cur.type] = cur.label;
    return acc;
  }, {});
