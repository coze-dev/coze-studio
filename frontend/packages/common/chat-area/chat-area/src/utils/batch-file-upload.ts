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

export const findFileDataIndexById = (fileIdList: string[], id: string) => {
  if (!id) {
    return -1;
  }
  return fileIdList.findIndex(fileId => fileId === id);
};

/**
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/type
 * @link https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * The MIME for image types starts with image/
 */
export const isImage = (file: File) => file.type.startsWith('image/');
