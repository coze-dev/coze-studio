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

    // TODO: 遇到了 file.size 错误的 case 需要再检查
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
