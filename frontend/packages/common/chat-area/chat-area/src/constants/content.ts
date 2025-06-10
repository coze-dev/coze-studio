import { I18n } from '@coze-arch/i18n';
import {
  ContentBoxType,
  type IContentConfigs,
} from '@coze-common/chat-uikit-shared';

import { FileStatus } from '../store/types';

export const getContentConfigs: () => IContentConfigs = () => ({
  [ContentBoxType.TEXT]: {
    enable: true,
  },
  [ContentBoxType.IMAGE]: {
    enable: true,
  },
  [ContentBoxType.CARD]: {
    enable: true,
    copywriting: {
      empty: {
        title: I18n.t('card_not_support_display_title'),
        description: I18n.t('card_not_support_display_content'),
      },
    },
    region: CARD_BUILDER_ENV_STR,
  },
  [ContentBoxType.FILE]: {
    enable: true,
    fileAttributeKeys: {
      statusKey: 'upload_status',
      statusEnum: {
        successEnum: FileStatus.Success,
        failEnum: FileStatus.Error,
        cancelEnum: FileStatus.Canceled,
        uploadingEnum: FileStatus.Uploading,
      },
      percentKey: 'upload_percent',
    },
    copywriting: {
      tooltips: {
        cancel: I18n.t('bot_preview_file_cancel'),
        copy: I18n.t('bot_preview_file_copyURL'),
        retry: I18n.t('bot_preview_file_retry'),
      },
    },
  },
});
