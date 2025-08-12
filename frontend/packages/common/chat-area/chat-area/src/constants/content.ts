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
