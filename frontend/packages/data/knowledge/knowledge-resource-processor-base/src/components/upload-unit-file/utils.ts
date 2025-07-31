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
  UploadStatus,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';
import { KNOWLEDGE_UNIT_NAME_MAX_LEN } from '@coze-data/knowledge-modal-base';
import { type FileItem } from '@coze-arch/bot-semi/Upload';

import { getFileExtension } from '../../utils/common';

interface GetFileListMapRes {
  [key: string]: FileItem;
}

const getFileName = (uri: string) => uri.substring(0, uri.lastIndexOf('.'));

const getNameFromFileList = (unitList: FileItem[], index: number) =>
  unitList?.[index]?.name;

const getFileListMap = (fileList: FileItem[]): GetFileListMapRes =>
  fileList.reduce((acc: GetFileListMapRes, item) => {
    acc[item.uid || ''] = item;
    return acc;
  }, {});

/** Filter the fileList to keep only the files in the unitList, that is, the files that were uploaded successfully. */
export const filterFileListByUnitList = (
  fileList: FileItem[],
  unitList: UnitItem[],
): FileItem[] =>
  fileList.filter(fileItem =>
    unitList?.find(unitItem => unitItem.uri === fileItem?.response?.upload_uri),
  );

const fileItem2UnitItem = (
  file: FileItem,
  config?: { filename?: string },
): UnitItem => ({
  type: getFileExtension(file?.response?.upload_uri || file.name),
  uri: file?.response?.upload_uri,
  url: file?.response?.upload_url,
  name: (config?.filename ?? getFileName(file.name)).slice(
    0,
    KNOWLEDGE_UNIT_NAME_MAX_LEN,
  ),
  size: file.size,
  status: file.status as UnitItem['status'],
  percent: file.percent || 0,
  fileInstance: file.fileInstance,
  uid: file.uid,
  validateMessage: (file.validateMessage as string) || '',
});

export const filterFileList = (fileList: FileItem[]): UnitItem[] => {
  const filteredList: UnitItem[] = fileList
    .filter(
      item =>
        !(!item.shouldUpload && item.status === UploadStatus.VALIDATE_FAIL),
    )
    .map((file, index) => {
      const filename = getNameFromFileList(fileList, index);
      return fileItem2UnitItem(file, { filename });
    });
  return filteredList;
};

export const filterUnitList = (
  unitList: UnitItem[],
  fileList: FileItem[],
): UnitItem[] => {
  const fileListMap = getFileListMap(fileList);
  return unitList
    .filter(unit => {
      const file = fileListMap[unit.uid || ''];
      if (!file.shouldUpload && file.status === UploadStatus.VALIDATE_FAIL) {
        return false;
      }
      return true;
    })
    .map((unit, index) => {
      const file = fileListMap[unit.uid || ''];
      const filename = getNameFromFileList(fileList, index);
      return {
        ...unit,
        ...fileItem2UnitItem(file, { filename }),
      };
    });
};
