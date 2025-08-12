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

import { type ClipboardEvent } from 'react';

import { nanoid } from 'nanoid';

import { getFileListByPaste } from '../../utils/upload';
import { usePreference } from '../../context/preference';
import { useValidateFileList } from './use-validate-file-list';
import { useCreateFileAndUpload } from './use-upload';

export const usePasteUpload = () => {
  const uploadFile = useCreateFileAndUpload();
  const { fileLimit, enablePasteUpload } = usePreference();
  const validateFileList = useValidateFileList();

  return (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!enablePasteUpload) {
      return;
    }

    const fileList = getFileListByPaste(e);

    // If the number of pasted files is empty, return
    if (!fileList.length) {
      return;
    }

    // Block default paste behavior
    e.preventDefault();

    const verifiedFileList = validateFileList({ fileLimit, fileList });

    // file validation
    if (!verifiedFileList.length) {
      return;
    }

    verifiedFileList.forEach(file => {
      uploadFile(nanoid(), file);
    });
  };
};
