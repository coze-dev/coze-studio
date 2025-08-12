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

import { type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { ImagePreview, UIToast } from '@coze-arch/bot-semi';
import { Layout } from '@coze-common/chat-uikit-shared';

import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';

import s from './index.module.less';
export const Preview: FC<{ layout?: Layout }> = ({ layout }) => {
  const { useFileStore } = useChatAreaStoreSet();

  const { previewURL, updatePreviewURL } = useFileStore(
    useShallow(state => ({
      previewURL: state.previewURL,
      updatePreviewURL: state.updatePreviewURL,
    })),
  );

  const resetPreviewUrl = () => {
    updatePreviewURL('');
  };
  return (
    <ImagePreview
      // The default z index for image preview is higher than toast and smaller
      zIndex={1009}
      previewCls={layout === Layout.MOBILE ? s['image-preview-mobile'] : ''}
      src={previewURL}
      // disableDownload
      onDownloadError={() => {
        UIToast.error(I18n.t('image_download_not_supported'));
      }}
      visible={Boolean(previewURL)}
      onVisibleChange={resetPreviewUrl}
    />
  );
};
