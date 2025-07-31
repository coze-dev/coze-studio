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
import { Toast } from '@coze-arch/bot-semi';
import { MAX_FILE_MBYTE } from '@coze-common/chat-uikit-shared';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { isNotEmptyFile, isFileSizeNotExceed } from '../../utils/upload';
import { isFileCountExceedsLimit } from '../../utils/is-file-count-exceeds-limit';
import {
  FILE_EXCEEDS_LIMIT_I18N_KEY,
  getFileSizeReachLimitI18n,
} from '../../constants/file';

export const useValidateFileList = () => {
  const { useBatchFileUploadStore } = useChatAreaStoreSet();

  return ({ fileLimit, fileList }: { fileList: File[]; fileLimit: number }) => {
    if (!fileList.length) {
      return [];
    }

    const hasExceedSizeFile = !fileList.every(isFileSizeNotExceed);
    const hasEmptyFile = !fileList.every(isNotEmptyFile);

    // TODO: The case of file.size error needs to be checked again.
    if (hasExceedSizeFile) {
      Toast.warning({
        content: getFileSizeReachLimitI18n({
          limitText: `${MAX_FILE_MBYTE}MB`,
        }),
        showClose: false,
      });
    }

    if (hasEmptyFile) {
      Toast.warning({
        content: I18n.t('upload_empty_file'),
        showClose: false,
      });
    }

    const filteredFileList = fileList
      .filter(isFileSizeNotExceed)
      .filter(isNotEmptyFile);

    if (
      isFileCountExceedsLimit({
        fileCount: filteredFileList.length,
        fileLimit,
        existingFileCount: useBatchFileUploadStore
          .getState()
          .getExistingFileCount(),
      })
    ) {
      Toast.warning({
        content: I18n.t(FILE_EXCEEDS_LIMIT_I18N_KEY),
        showClose: false,
      });
      return [];
    }

    return filteredFileList;
  };
};
