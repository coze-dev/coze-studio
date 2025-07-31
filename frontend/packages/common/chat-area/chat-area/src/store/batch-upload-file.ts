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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

import { findFileDataIndexById, isImage } from '../utils/batch-file-upload';
import {
  type FileData,
  FileStatus,
  FileType,
  type BaseFileData,
} from './types';

export interface BatchUploadState {
  fileIdList: string[];
  fileDataMap: Record<string, FileData>;
  fileTypeMap: Record<string, FileType>;
}

export interface BatchUploadAction {
  //  Add new data to fileIdList, fileDataMap
  immerCreateFileData: (id: string, file: File) => void;
  immerDeleteFileDataById: (id: string) => void;
  immerUpdateFileDataById: (
    id: string,
    immerUpdater: (state: FileData) => void,
  ) => void;
  getFileDataList: () => FileData[];
  getFileType: (id: string) => FileType | undefined;
  // Is there a file being uploaded?
  hasFileNotSuccess: () => boolean;
  clearAllData: () => void;
  getExistingFileCount: () => number;
}

const getDefaultState = (): BatchUploadState => ({
  fileDataMap: {},
  fileIdList: [],
  fileTypeMap: {},
});

export const createBatchFileUploadStore = (mark: string) =>
  create<BatchUploadState & BatchUploadAction>()(
    devtools(
      (set, get) => ({
        ...getDefaultState(),
        immerCreateFileData: (id, file) => {
          set(
            produce<BatchUploadState>(state => {
              const baseFileData: BaseFileData = {
                percent: 0,
                uri: null,
                file,
                id,
                status: FileStatus.Uploading,
              };
              const defaultFileData: FileData = isImage(file)
                ? {
                    ...baseFileData,
                    fileType: FileType.Image,
                    meta: null,
                  }
                : {
                    ...baseFileData,
                    fileType: FileType.File,
                  };

              if (state.fileDataMap[id]) {
                throw new Error(`duplicate file id ${id}`);
              }
              state.fileDataMap[id] = defaultFileData;
              state.fileTypeMap[id] = defaultFileData.fileType;
              state.fileIdList.push(id);
            }),
            false,
            'immerCreateFileData',
          );
        },
        immerDeleteFileDataById: id => {
          set(
            produce<BatchUploadState>(state => {
              const idx = findFileDataIndexById(state.fileIdList, id);
              if (idx < 0) {
                throw new Error(`failed to find file ${id}`);
              }
              state.fileIdList.splice(idx, 1);
              delete state.fileDataMap[id];
              delete state.fileTypeMap[id];
            }),
            false,
            'immerDeleteFileDataById',
          );
        },
        immerUpdateFileDataById: (id, immerUpdater) => {
          set(
            produce<BatchUploadState>(state => {
              const data = state.fileDataMap[id];
              if (!data) {
                throw new Error(`failed to find file ${id}`);
              }
              immerUpdater(data);
            }),
            false,
            'immerUpdateFileDataById',
          );
        },
        hasFileNotSuccess: () =>
          get().fileIdList.some(
            id => get().fileDataMap[id]?.status !== FileStatus.Success,
          ),
        clearAllData: () => {
          set(getDefaultState(), false, 'clearAllData');
        },
        getFileDataList: () =>
          get()
            .fileIdList.map(id => get().fileDataMap[id])
            .filter((data): data is FileData => Boolean(data)),
        getFileType: id => get().fileTypeMap[id],
        getExistingFileCount: () => get().fileIdList.length,
      }),
      {
        enabled: IS_DEV_MODE,
        name: `botStudio.ChatAreaBatchFileUpload.${mark}`,
      },
    ),
  );

export type BatchFileUploadStore = ReturnType<
  typeof createBatchFileUploadStore
>;
